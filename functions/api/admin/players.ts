import {
  getCurrentPlayer,
  hashPassword,
  jsonResponse,
  recordAuditLog,
  requireSameOrigin,
  type AuthEnv,
  type AuthPlayer,
  type PlayerRole,
} from "../../_lib/auth";

const POSITION_GROUPS = ["goalkeeper", "defender", "midfield", "forward"] as const;
const ROLES: PlayerRole[] = ["player", "captain", "admin"];

interface PlayerInput {
  positionGroup: string;
  position: string;
  number: number | null;
  filename: string;
  name: string;
  enName: string | null;
  club: string | null;
  nationality: string | null;
  nationalityFlag: string | null;
  province: string | null;
  age: number | null;
  birthday: string | null;
  height: number | null;
  weight: number | null;
  foot: string | null;
  starts: number;
  subs: number;
  goals: number;
  role: PlayerRole;
  loginEnabled: number;
}

export const onRequestGet: PagesFunction<AuthEnv> = async ({ env, request }) => {
  const auth = await requireAdmin(env, request);
  if ("response" in auth) return auth.response;

  const { results } = await env.DB.prepare(
    `
      SELECT
        id,
        positionGroup,
        position,
        number,
        filename,
        name,
        enName,
        club,
        nationality,
        nationalityFlag,
        province,
        age,
        birthday,
        height,
        weight,
        foot,
        starts,
        subs,
        goals,
        username,
        role,
        loginEnabled,
        lastLoginAt
      FROM players
      ORDER BY positionGroup, number
    `
  ).all();

  return jsonResponse({ players: results });
};

export const onRequestPost: PagesFunction<AuthEnv> = async ({ env, request }) => {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const auth = await requireAdmin(env, request);
  if ("response" in auth) return auth.response;

  const input = await parsePlayerInput(request);
  if ("response" in input) return input.response;

  const duplicate = await env.DB.prepare(
    "SELECT id FROM players WHERE lower(filename) = lower(?) OR lower(username) = lower(?) LIMIT 1"
  ).bind(input.filename, input.filename).first();
  if (duplicate) return jsonResponse({ error: "filename_already_exists" }, { status: 409 });

  const passwordHash = await hashPassword(`${input.filename}_123`);

  const result = await env.DB.prepare(
    `
      INSERT INTO players (
        positionGroup,
        position,
        number,
        filename,
        name,
        enName,
        club,
        nationality,
        nationalityFlag,
        province,
        age,
        birthday,
        height,
        weight,
        foot,
        starts,
        subs,
        goals,
        username,
        passwordHash,
        role,
        loginEnabled
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(
      input.positionGroup,
      input.position,
      input.number,
      input.filename,
      input.name,
      input.enName,
      input.club,
      input.nationality,
      input.nationalityFlag,
      input.province,
      input.age,
      input.birthday,
      input.height,
      input.weight,
      input.foot,
      input.starts,
      input.subs,
      input.goals,
      input.filename,
      passwordHash,
      input.role,
      input.loginEnabled
    )
    .run();

  const id = result.meta.last_row_id;
  const row = await getAdminPlayer(env, id);
  await recordAuditLog(env, request, auth.player, {
    action: "player.create",
    resourceType: "player",
    resourceId: id,
    details: { after: row, initialPasswordRule: "filename_123" },
  });
  return jsonResponse({ player: row }, { status: 201 });
};

export const onRequest: PagesFunction<AuthEnv> = async () => {
  return jsonResponse({ error: "method_not_allowed" }, { status: 405 });
};

async function requireAdmin(
  env: AuthEnv,
  request: Request
): Promise<{ player: AuthPlayer } | { response: Response }> {
  const player = await getCurrentPlayer(env, request);
  if (!player) return { response: jsonResponse({ error: "unauthorized" }, { status: 401 }) };
  if (player.role !== "admin") {
    return { response: jsonResponse({ error: "forbidden" }, { status: 403 }) };
  }
  return { player };
}

async function getAdminPlayer(env: AuthEnv, id: number) {
  return env.DB.prepare(
    `
      SELECT
        id,
        positionGroup,
        position,
        number,
        filename,
        name,
        enName,
        club,
        nationality,
        nationalityFlag,
        province,
        age,
        birthday,
        height,
        weight,
        foot,
        starts,
        subs,
        goals,
        username,
        role,
        loginEnabled,
        lastLoginAt
      FROM players
      WHERE id = ?
    `
  ).bind(id).first();
}

async function parsePlayerInput(
  request: Request
): Promise<PlayerInput | { response: Response }> {
  let body: Record<string, unknown>;
  try {
    const raw = await request.json();
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return { response: jsonResponse({ error: "invalid_json" }, { status: 400 }) };
    }
    body = raw as Record<string, unknown>;
  } catch {
    return { response: jsonResponse({ error: "invalid_json" }, { status: 400 }) };
  }

  return parsePlayerBody(body);
}

export function parsePlayerBody(body: Record<string, unknown>): PlayerInput | { response: Response } {
  const positionGroup = stringField(body.positionGroup);
  const position = stringField(body.position);
  const filename = stringField(body.filename);
  const name = stringField(body.name);
  const role = stringField(body.role) || "player";

  if (!POSITION_GROUPS.includes(positionGroup as (typeof POSITION_GROUPS)[number])) {
    return { response: jsonResponse({ error: "invalid_position_group" }, { status: 400 }) };
  }
  if (!position || !filename || !name) {
    return { response: jsonResponse({ error: "required_fields_missing" }, { status: 400 }) };
  }
  if (!/^[a-z0-9_-]{1,64}$/i.test(filename)) {
    return { response: jsonResponse({ error: "invalid_filename" }, { status: 400 }) };
  }
  if (!ROLES.includes(role as PlayerRole)) {
    return { response: jsonResponse({ error: "invalid_role" }, { status: 400 }) };
  }

  const number = nullableInt(body.number, "number", 0, 999);
  const age = nullableInt(body.age, "age", 0, 80);
  const height = nullableInt(body.height, "height", 0, 260);
  const weight = nullableInt(body.weight, "weight", 0, 260);
  const starts = intField(body.starts, "starts", 0, 1000, 0);
  const subs = intField(body.subs, "subs", 0, 1000, 0);
  const goals = intField(body.goals, "goals", 0, 1000, 0);

  const invalidNumber = [number, age, height, weight, starts, subs, goals].find(
    (value) => value === Number.NEGATIVE_INFINITY
  );
  if (invalidNumber !== undefined) {
    return { response: jsonResponse({ error: "invalid_number_field" }, { status: 400 }) };
  }

  const loginEnabledRaw = body.loginEnabled;
  const loginEnabled =
    loginEnabledRaw === false || loginEnabledRaw === 0 || loginEnabledRaw === "0" ? 0 : 1;

  return {
    positionGroup,
    position,
    number,
    filename,
    name,
    enName: nullableStringField(body.enName),
    club: nullableStringField(body.club),
    nationality: nullableStringField(body.nationality),
    nationalityFlag: nullableStringField(body.nationalityFlag),
    province: nullableStringField(body.province),
    age,
    birthday: nullableStringField(body.birthday),
    height,
    weight,
    foot: nullableStringField(body.foot),
    starts,
    subs,
    goals,
    role: role as PlayerRole,
    loginEnabled,
  };
}

function stringField(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function nullableStringField(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function nullableInt(value: unknown, field: string, min: number, max: number): number | null {
  if (value === null || value === undefined || value === "") return null;
  return intField(value, field, min, max, Number.NEGATIVE_INFINITY);
}

function intField(
  value: unknown,
  _field: string,
  min: number,
  max: number,
  fallback: number
): number {
  if (value === null || value === undefined || value === "") return fallback;
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    return Number.NEGATIVE_INFINITY;
  }
  return number;
}
