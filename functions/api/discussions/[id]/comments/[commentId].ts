import {
  getCurrentPlayer,
  jsonResponse,
  recordAuditLog,
  requireSameOrigin,
  type AuthEnv,
} from "../../../../_lib/auth";

export const onRequestDelete: PagesFunction<AuthEnv> = async ({ env, request, params }) => {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const player = await getCurrentPlayer(env, request);
  if (!player) return jsonResponse({ error: "unauthorized" }, { status: 401 });

  const threadId = parseId(params.id);
  const commentId = parseId(params.commentId);
  if (!threadId || !commentId) {
    return jsonResponse({ error: "invalid_comment_id" }, { status: 400 });
  }

  const comment = await env.DB.prepare(
    `
      SELECT id, authorPlayerId
      FROM discussion_comments
      WHERE id = ?
        AND threadId = ?
        AND deletedAt IS NULL
    `
  ).bind(commentId, threadId).first<{ id: number; authorPlayerId: number }>();
  if (!comment) return jsonResponse({ error: "not_found" }, { status: 404 });

  const canDelete = player.role === "admin" ||
    player.role === "captain" ||
    player.id === comment.authorPlayerId;
  if (!canDelete) return jsonResponse({ error: "forbidden" }, { status: 403 });

  await env.DB.prepare(
    "UPDATE discussion_comments SET deletedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(commentId).run();

  await env.DB.prepare(
    "UPDATE discussion_threads SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(threadId).run();

  await recordAuditLog(env, request, player, {
    action: "discussion.comment.delete",
    resourceType: "discussion_comment",
    resourceId: commentId,
    details: { threadId, before: comment },
  });

  return jsonResponse({ ok: true });
};

export const onRequest: PagesFunction<AuthEnv> = async () => {
  return jsonResponse({ error: "method_not_allowed" }, { status: 405 });
};

function parseId(value: string | string[] | undefined): number | null {
  const id = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
