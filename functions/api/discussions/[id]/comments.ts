import {
  getCurrentPlayer,
  jsonResponse,
  requireSameOrigin,
} from "../../../_lib/auth";
import {
  emitCommentAuditEvent,
  type CommentEventEnv,
} from "../../../_lib/commentEvents";

export const onRequestPost: PagesFunction<CommentEventEnv> = async ({ env, request, params }) => {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const player = await getCurrentPlayer(env, request);
  if (!player) return jsonResponse({ error: "unauthorized" }, { status: 401 });

  const threadId = parseId(params.id);
  if (!threadId) return jsonResponse({ error: "invalid_thread_id" }, { status: 400 });

  const thread = await env.DB.prepare(
    "SELECT id, locked FROM discussion_threads WHERE id = ? AND deletedAt IS NULL"
  ).bind(threadId).first<{ id: number; locked: number }>();
  if (!thread) return jsonResponse({ error: "not_found" }, { status: 404 });
  if (thread.locked === 1 && player.role !== "admin" && player.role !== "captain") {
    return jsonResponse({ error: "thread_locked" }, { status: 403 });
  }

  const input = await parseCommentInput(request);
  if ("response" in input) return input.response;

  const result = await env.DB.prepare(
    "INSERT INTO discussion_comments (threadId, authorPlayerId, body) VALUES (?, ?, ?)"
  ).bind(threadId, player.id, input.body).run();

  await env.DB.prepare(
    "UPDATE discussion_threads SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(threadId).run();

  const comment = await env.DB.prepare(
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
      WHERE c.id = ?
    `
  ).bind(result.meta.last_row_id).first();

  await emitCommentAuditEvent(env, request, player, "discussion_comment_created", {
    action: "discussion.comment.create",
    resourceType: "discussion_comment",
    resourceId: result.meta.last_row_id,
    details: { threadId, after: comment },
  });

  return jsonResponse({ comment }, { status: 201 });
};

export const onRequest: PagesFunction<CommentEventEnv> = async () => {
  return jsonResponse({ error: "method_not_allowed" }, { status: 405 });
};

async function parseCommentInput(
  request: Request
): Promise<{ body: string } | { response: Response }> {
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

  const body = typeof raw.body === "string" ? raw.body.trim() : "";
  if (!body || body.length > 2000) {
    return { response: jsonResponse({ error: "invalid_body" }, { status: 400 }) };
  }

  return { body };
}

function parseId(value: string | string[] | undefined): number | null {
  const id = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
