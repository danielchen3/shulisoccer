import {
  getCurrentPlayer,
  jsonResponse,
  recordAuditLog,
  requireSameOrigin,
  type AuthEnv,
} from "../../_lib/auth";

interface CommentOwnerRow {
  id: number;
  authorPlayerId: number;
  targetType: string;
  targetId: string;
}

export const onRequestDelete: PagesFunction<AuthEnv> = async ({ env, request, params }) => {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const player = await getCurrentPlayer(env, request);
  if (!player) return jsonResponse({ error: "unauthorized" }, { status: 401 });

  const id = parseId(params.id);
  if (!id) return jsonResponse({ error: "invalid_comment_id" }, { status: 400 });

  const comment = await env.DB.prepare(
    `
      SELECT id, authorPlayerId, targetType, targetId
      FROM content_comments
      WHERE id = ?
        AND deletedAt IS NULL
    `
  ).bind(id).first<CommentOwnerRow>();
  if (!comment) return jsonResponse({ error: "not_found" }, { status: 404 });

  const canDelete = player.role === "admin" ||
    player.role === "captain" ||
    player.id === comment.authorPlayerId;
  if (!canDelete) return jsonResponse({ error: "forbidden" }, { status: 403 });

  await env.DB.prepare(
    "UPDATE content_comments SET deletedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(id).run();

  await recordAuditLog(env, request, player, {
    action: "content_comment.delete",
    resourceType: "content_comment",
    resourceId: id,
    details: {
      targetType: comment.targetType,
      targetId: comment.targetId,
      before: comment,
    },
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
