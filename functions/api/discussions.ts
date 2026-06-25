import {
  getCurrentPlayer,
  jsonResponse,
  recordAuditLog,
  requireSameOrigin,
  type AuthEnv,
  type AuthPlayer,
} from "../_lib/auth";

const CATEGORIES = ["general", "training", "match", "tactics", "announcement"] as const;

export const onRequestGet: PagesFunction<AuthEnv> = async ({ env, request }) => {
  const auth = await requireDiscussionAuth(env, request);
  if ("response" in auth) return auth.response;

  const url = new URL(request.url);
  const category = url.searchParams.get("category") ?? "all";
  const limit = clampInt(url.searchParams.get("limit"), 1, 50, 20);
  const offset = clampInt(url.searchParams.get("offset"), 0, 10000, 0);

  const categoryFilter = CATEGORIES.includes(category as (typeof CATEGORIES)[number])
    ? "AND t.category = ?"
    : "";
  const bindings = categoryFilter ? [category, limit, offset] : [limit, offset];

  const { results } = await env.DB.prepare(
    `
      SELECT
        t.id,
        t.category,
        t.title,
        t.body,
        t.pinned,
        t.locked,
        t.createdAt,
        t.updatedAt,
        p.id AS authorId,
        p.name AS authorName,
        p.filename AS authorFilename,
        p.role AS authorRole,
        COUNT(c.id) AS commentCount
      FROM discussion_threads t
      JOIN players p ON p.id = t.authorPlayerId
      LEFT JOIN discussion_comments c
        ON c.threadId = t.id
        AND c.deletedAt IS NULL
      WHERE t.deletedAt IS NULL
      ${categoryFilter}
      GROUP BY t.id
      ORDER BY t.pinned DESC, t.updatedAt DESC, t.id DESC
      LIMIT ? OFFSET ?
    `
  ).bind(...bindings).all();

  return jsonResponse({ threads: results });
};

export const onRequestPost: PagesFunction<AuthEnv> = async ({ env, request }) => {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const auth = await requireDiscussionAuth(env, request);
  if ("response" in auth) return auth.response;

  const input = await parseThreadInput(request, auth.player);
  if ("response" in input) return input.response;

  const result = await env.DB.prepare(
    `
      INSERT INTO discussion_threads
        (authorPlayerId, category, title, body, pinned, locked)
      VALUES (?, ?, ?, ?, ?, ?)
    `
  ).bind(
    auth.player.id,
    input.category,
    input.title,
    input.body,
    input.pinned,
    input.locked
  ).run();

  const thread = await getThreadSummary(env, result.meta.last_row_id);
  await recordAuditLog(env, request, auth.player, {
    action: "discussion.thread.create",
    resourceType: "discussion_thread",
    resourceId: result.meta.last_row_id,
    details: { after: thread },
  });
  return jsonResponse({ thread }, { status: 201 });
};

export const onRequest: PagesFunction<AuthEnv> = async () => {
  return jsonResponse({ error: "method_not_allowed" }, { status: 405 });
};

async function requireDiscussionAuth(
  env: AuthEnv,
  request: Request
): Promise<{ player: AuthPlayer } | { response: Response }> {
  const player = await getCurrentPlayer(env, request);
  if (!player) return { response: jsonResponse({ error: "unauthorized" }, { status: 401 }) };
  return { player };
}

async function parseThreadInput(
  request: Request,
  player: AuthPlayer
): Promise<
  { category: string; title: string; body: string; pinned: number; locked: number } |
  { response: Response }
> {
  let raw: Record<string, unknown>;
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return { response: jsonResponse({ error: "invalid_json" }, { status: 400 }) };
    }
    raw = body as Record<string, unknown>;
  } catch {
    return { response: jsonResponse({ error: "invalid_json" }, { status: 400 }) };
  }

  const category = typeof raw.category === "string" ? raw.category.trim() : "general";
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const body = typeof raw.body === "string" ? raw.body.trim() : "";
  const canModerate = player.role === "admin" || player.role === "captain";

  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return { response: jsonResponse({ error: "invalid_category" }, { status: 400 }) };
  }
  if (category === "announcement" && !canModerate) {
    return { response: jsonResponse({ error: "announcement_requires_moderator" }, { status: 403 }) };
  }
  if (!title || !body) {
    return { response: jsonResponse({ error: "title_and_body_required" }, { status: 400 }) };
  }
  if (title.length > 120 || body.length > 5000) {
    return { response: jsonResponse({ error: "field_too_long" }, { status: 400 }) };
  }

  return {
    category,
    title,
    body,
    pinned: canModerate && raw.pinned === true ? 1 : 0,
    locked: canModerate && raw.locked === true ? 1 : 0,
  };
}

async function getThreadSummary(env: AuthEnv, id: number) {
  return env.DB.prepare(
    `
      SELECT
        t.id,
        t.category,
        t.title,
        t.body,
        t.pinned,
        t.locked,
        t.createdAt,
        t.updatedAt,
        p.id AS authorId,
        p.name AS authorName,
        p.filename AS authorFilename,
        p.role AS authorRole,
        0 AS commentCount
      FROM discussion_threads t
      JOIN players p ON p.id = t.authorPlayerId
      WHERE t.id = ?
    `
  ).bind(id).first();
}

function clampInt(value: string | null, min: number, max: number, fallback: number): number {
  const number = value === null ? fallback : Number(value);
  if (!Number.isInteger(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}
