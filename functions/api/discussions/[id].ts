import {
  getCurrentPlayer,
  jsonResponse,
  recordAuditLog,
  requireSameOrigin,
  type AuthEnv,
  type AuthPlayer,
} from "../../_lib/auth";

const CATEGORIES = ["general", "training", "match", "tactics", "announcement"] as const;

interface ThreadRow {
  id: number;
  authorPlayerId: number;
  category: string;
  title: string;
  body: string;
  pinned: number;
  locked: number;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  authorName: string;
  authorFilename: string;
  authorRole: string;
}

export const onRequestGet: PagesFunction<AuthEnv> = async ({ env, request, params }) => {
  const auth = await requireDiscussionAuth(env, request);
  if ("response" in auth) return auth.response;

  const id = parseId(params.id);
  if (!id) return jsonResponse({ error: "invalid_thread_id" }, { status: 400 });

  const thread = await getThread(env, id);
  if (!thread) return jsonResponse({ error: "not_found" }, { status: 404 });

  const { results: comments } = await env.DB.prepare(
    `
      SELECT
        c.id,
        c.body,
        c.createdAt,
        c.updatedAt,
        p.id AS authorId,
        p.name AS authorName,
        p.filename AS authorFilename,
        p.role AS authorRole
      FROM discussion_comments c
      JOIN players p ON p.id = c.authorPlayerId
      WHERE c.threadId = ?
        AND c.deletedAt IS NULL
      ORDER BY c.createdAt ASC, c.id ASC
    `
  ).bind(id).all();

  return jsonResponse({ thread, comments });
};

export const onRequestPatch: PagesFunction<AuthEnv> = async ({ env, request, params }) => {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const auth = await requireDiscussionAuth(env, request);
  if ("response" in auth) return auth.response;

  const id = parseId(params.id);
  if (!id) return jsonResponse({ error: "invalid_thread_id" }, { status: 400 });

  const existing = await getThread(env, id);
  if (!existing) return jsonResponse({ error: "not_found" }, { status: 404 });

  const canModerate = isModerator(auth.player);
  const canEditOwn = auth.player.id === existing.authorPlayerId;
  if (!canModerate && !canEditOwn) {
    return jsonResponse({ error: "forbidden" }, { status: 403 });
  }

  const patch = await parsePatchInput(request, auth.player, existing.category);
  if ("response" in patch) return patch.response;

  const assignments = patch.fields.map((field) => `${field} = ?`).join(", ");
  await env.DB.prepare(`UPDATE discussion_threads SET ${assignments}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(...patch.values, id)
    .run();

  const thread = await getThread(env, id);
  await recordAuditLog(env, request, auth.player, {
    action: "discussion.thread.update",
    resourceType: "discussion_thread",
    resourceId: id,
    details: { before: existing, after: thread },
  });
  return jsonResponse({ thread });
};

export const onRequestDelete: PagesFunction<AuthEnv> = async ({ env, request, params }) => {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const auth = await requireDiscussionAuth(env, request);
  if ("response" in auth) return auth.response;

  const id = parseId(params.id);
  if (!id) return jsonResponse({ error: "invalid_thread_id" }, { status: 400 });

  const existing = await env.DB.prepare(
    "SELECT id, authorPlayerId FROM discussion_threads WHERE id = ? AND deletedAt IS NULL"
  ).bind(id).first<{ id: number; authorPlayerId: number }>();
  if (!existing) return jsonResponse({ error: "not_found" }, { status: 404 });

  if (!isModerator(auth.player) && auth.player.id !== existing.authorPlayerId) {
    return jsonResponse({ error: "forbidden" }, { status: 403 });
  }

  await env.DB.prepare(
    "UPDATE discussion_threads SET deletedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(id).run();

  await recordAuditLog(env, request, auth.player, {
    action: "discussion.thread.delete",
    resourceType: "discussion_thread",
    resourceId: id,
    details: { before: existing },
  });

  return jsonResponse({ ok: true });
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

async function getThread(env: AuthEnv, id: number): Promise<ThreadRow | null> {
  return env.DB.prepare(
    `
      SELECT
        t.id,
        t.authorPlayerId,
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
        p.role AS authorRole
      FROM discussion_threads t
      JOIN players p ON p.id = t.authorPlayerId
      WHERE t.id = ?
        AND t.deletedAt IS NULL
    `
  ).bind(id).first<ThreadRow>();
}

async function parsePatchInput(
  request: Request,
  player: AuthPlayer,
  existingCategory: string
): Promise<{ fields: string[]; values: (string | number)[] } | { response: Response }> {
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

  const fields: string[] = [];
  const values: (string | number)[] = [];
  const canModerate = isModerator(player);

  if ("title" in raw) {
    const title = typeof raw.title === "string" ? raw.title.trim() : "";
    if (!title || title.length > 120) {
      return { response: jsonResponse({ error: "invalid_title" }, { status: 400 }) };
    }
    fields.push("title");
    values.push(title);
  }

  if ("body" in raw) {
    const body = typeof raw.body === "string" ? raw.body.trim() : "";
    if (!body || body.length > 5000) {
      return { response: jsonResponse({ error: "invalid_body" }, { status: 400 }) };
    }
    fields.push("body");
    values.push(body);
  }

  if ("category" in raw) {
    const category = typeof raw.category === "string" ? raw.category.trim() : existingCategory;
    if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
      return { response: jsonResponse({ error: "invalid_category" }, { status: 400 }) };
    }
    if (category === "announcement" && !canModerate) {
      return { response: jsonResponse({ error: "announcement_requires_moderator" }, { status: 403 }) };
    }
    fields.push("category");
    values.push(category);
  }

  if ("pinned" in raw || "locked" in raw) {
    if (!canModerate) return { response: jsonResponse({ error: "forbidden" }, { status: 403 }) };
    if ("pinned" in raw) {
      fields.push("pinned");
      values.push(raw.pinned === true ? 1 : 0);
    }
    if ("locked" in raw) {
      fields.push("locked");
      values.push(raw.locked === true ? 1 : 0);
    }
  }

  if (fields.length === 0) {
    return { response: jsonResponse({ error: "no_fields_to_update" }, { status: 400 }) };
  }

  return { fields, values };
}

function parseId(value: string | string[] | undefined): number | null {
  const id = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function isModerator(player: AuthPlayer): boolean {
  return player.role === "admin" || player.role === "captain";
}
