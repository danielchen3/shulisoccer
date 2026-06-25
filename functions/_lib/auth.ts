export type PlayerRole = "player" | "captain" | "admin";

export interface AuthEnv {
  DB: D1Database;
}

export interface AuthPlayer {
  id: number;
  filename: string | null;
  name: string;
  username: string | null;
  role: PlayerRole;
}

export interface AuditLogInput {
  eventId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | number | null;
  details?: unknown;
}

interface SessionRow {
  tokenHash: string;
  expiresAt: string;
}

interface PlayerAuthRow extends AuthPlayer {
  passwordHash: string | null;
  loginEnabled: number;
}

const SESSION_COOKIE = "shuli_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_ITERATIONS = 100_000;

export function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return Response.json(body, {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init?.headers ?? {}),
    },
  });
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      return body as Record<string, unknown>;
    }
  } catch {
    // Fall through to a consistent 400 response.
  }
  throw new Response(JSON.stringify({ error: "invalid_json" }), {
    status: 400,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export function getSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (rawName === SESSION_COOKIE) {
      return rawValue.join("=") || null;
    }
  }

  return null;
}

export async function getCurrentPlayer(env: AuthEnv, request: Request): Promise<AuthPlayer | null> {
  const token = getSessionToken(request);
  if (!token) return null;

  const tokenHash = await sha256Base64Url(token);
  const row = await env.DB.prepare(
    `
      SELECT
        s.tokenHash,
        s.expiresAt,
        p.id,
        p.filename,
        p.name,
        p.username,
        p.role
      FROM sessions s
      JOIN players p ON p.id = s.playerId
      WHERE s.tokenHash = ?
        AND s.expiresAt > datetime('now')
        AND p.loginEnabled = 1
      LIMIT 1
    `
  ).bind(tokenHash).first<SessionRow & AuthPlayer>();

  if (!row) return null;

  await env.DB.prepare(
    "UPDATE sessions SET lastSeenAt = CURRENT_TIMESTAMP WHERE tokenHash = ?"
  ).bind(row.tokenHash).run();

  return {
    id: row.id,
    filename: row.filename,
    name: row.name,
    username: row.username,
    role: row.role,
  };
}

export async function requireAuth(env: AuthEnv, request: Request): Promise<AuthPlayer> {
  const player = await getCurrentPlayer(env, request);
  if (!player) {
    throw jsonResponse({ error: "unauthorized" }, { status: 401 });
  }
  return player;
}

export function requireRole(player: AuthPlayer, allowedRoles: PlayerRole[]): void {
  if (!allowedRoles.includes(player.role)) {
    throw jsonResponse({ error: "forbidden" }, { status: 403 });
  }
}

export async function findLoginPlayer(
  env: AuthEnv,
  username: string
): Promise<PlayerAuthRow | null> {
  return env.DB.prepare(
    `
      SELECT id, filename, name, username, role, passwordHash, loginEnabled
      FROM players
      WHERE lower(username) = lower(?)
      LIMIT 1
    `
  ).bind(username).first<PlayerAuthRow>();
}

export async function createSession(
  env: AuthEnv,
  request: Request,
  playerId: number
): Promise<{ token: string; expiresAt: string }> {
  const token = randomToken();
  const tokenHash = await sha256Base64Url(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
  const ipAddress = request.headers.get("cf-connecting-ip");
  const userAgent = request.headers.get("user-agent");

  try {
    await insertSession(env, playerId, tokenHash, expiresAt, userAgent, ipAddress);
  } catch (error) {
    console.error("failed to insert session; ensuring sessions table", error);
    await ensureSessionsTable(env);
    await insertSession(env, playerId, tokenHash, expiresAt, userAgent, ipAddress);
  }

  try {
    await env.DB.prepare(
      "UPDATE players SET lastLoginAt = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(playerId).run();
  } catch (error) {
    console.error("failed to update lastLoginAt", error);
  }

  return { token, expiresAt };
}

async function insertSession(
  env: AuthEnv,
  playerId: number,
  tokenHash: string,
  expiresAt: string,
  userAgent: string | null,
  ipAddress: string | null
): Promise<void> {
  await env.DB.prepare(
    `
      INSERT INTO sessions (playerId, tokenHash, expiresAt, userAgent, ipAddress)
      VALUES (?, ?, ?, ?, ?)
    `
  ).bind(playerId, tokenHash, expiresAt, userAgent, ipAddress).run();
}

async function ensureSessionsTable(env: AuthEnv): Promise<void> {
  await env.DB.batch([
    env.DB.prepare(
      `
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          playerId INTEGER NOT NULL,
          tokenHash TEXT NOT NULL UNIQUE,
          createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          expiresAt TEXT NOT NULL,
          lastSeenAt TEXT,
          userAgent TEXT,
          ipAddress TEXT,
          FOREIGN KEY (playerId) REFERENCES players(id) ON DELETE CASCADE
        )
      `
    ),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_sessions_player_id ON sessions(playerId)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expiresAt)"),
  ]);
}

export async function deleteCurrentSession(env: AuthEnv, request: Request): Promise<void> {
  const token = getSessionToken(request);
  if (!token) return;

  const tokenHash = await sha256Base64Url(token);
  await env.DB.prepare("DELETE FROM sessions WHERE tokenHash = ?").bind(tokenHash).run();
}

export function sessionCookie(token: string, requestUrl: string): string {
  return [
    `${SESSION_COOKIE}=${token}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${SESSION_TTL_SECONDS}`,
    new URL(requestUrl).protocol === "https:" ? "Secure" : "",
  ].filter(Boolean).join("; ");
}

export function expiredSessionCookie(requestUrl: string): string {
  return [
    `${SESSION_COOKIE}=`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    "Max-Age=0",
    new URL(requestUrl).protocol === "https:" ? "Secure" : "",
  ].filter(Boolean).join("; ");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, PASSWORD_ITERATIONS);
  return [
    "pbkdf2_sha256",
    String(PASSWORD_ITERATIONS),
    bytesToBase64Url(salt),
    bytesToBase64Url(hash),
  ].join("$");
}

export async function verifyPassword(password: string, storedHash: string | null): Promise<boolean> {
  if (!storedHash) return false;

  const [scheme, iterationsRaw, saltRaw, hashRaw] = storedHash.split("$");
  if (scheme !== "pbkdf2_sha256" || !iterationsRaw || !saltRaw || !hashRaw) {
    return false;
  }

  const iterations = Number(iterationsRaw);
  if (!Number.isInteger(iterations) || iterations < 10_000) {
    return false;
  }

  const salt = base64UrlToBytes(saltRaw);
  const expectedHash = base64UrlToBytes(hashRaw);
  const actualHash = await pbkdf2(password, salt, iterations);

  return fixedTimeEquals(actualHash, expectedHash);
}

export function publicPlayer(player: AuthPlayer): AuthPlayer {
  return {
    id: player.id,
    filename: player.filename,
    name: player.name,
    username: player.username,
    role: player.role,
  };
}

export function requireSameOrigin(request: Request): Response | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  if (origin !== new URL(request.url).origin) {
    return jsonResponse({ error: "invalid_origin" }, { status: 403 });
  }

  return null;
}

export async function recordAuditLog(
  env: AuthEnv,
  request: Request,
  actor: AuthPlayer,
  input: AuditLogInput
): Promise<void> {
  await recordAuditLogEntry(env, actor, input, {
    ipAddress: request.headers.get("cf-connecting-ip"),
    userAgent: request.headers.get("user-agent"),
  });
}

export async function recordAuditLogEntry(
  env: AuthEnv,
  actor: AuthPlayer,
  input: AuditLogInput,
  metadata: { ipAddress: string | null; userAgent: string | null }
): Promise<void> {
  try {
    await env.DB.prepare(
      `
        INSERT INTO audit_logs (
          eventId,
          actorPlayerId,
          actorName,
          actorRole,
          action,
          resourceType,
          resourceId,
          details,
          ipAddress,
          userAgent
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    ).bind(
      input.eventId ?? null,
      actor.id,
      actor.name,
      actor.role,
      input.action,
      input.resourceType,
      input.resourceId == null ? null : String(input.resourceId),
      input.details === undefined ? null : JSON.stringify(input.details),
      metadata.ipAddress,
      metadata.userAgent
    ).run();
  } catch (error) {
    console.error("failed to record audit log", error);
  }
}

async function pbkdf2(
  password: string,
  salt: Uint8Array,
  iterations: number
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256
  );
  return new Uint8Array(bits);
}

async function sha256Base64Url(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );
  return bytesToBase64Url(new Uint8Array(digest));
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToBase64Url(bytes);
}

function fixedTimeEquals(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    Math.ceil(value.length / 4) * 4,
    "="
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
