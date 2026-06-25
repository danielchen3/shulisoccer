import {
  getCurrentPlayer,
  jsonResponse,
  recordAuditLog,
  requireSameOrigin,
  type AuthEnv,
} from "../../../_lib/auth";

const REACTIONS = ["like", "heart", "fire", "clap", "laugh"] as const;

interface CommentTargetRow {
  id: number;
  targetType: string;
  targetId: string;
}

interface ReactionRow {
  reaction: string;
  count: number;
}

export const onRequestPost: PagesFunction<AuthEnv> = async ({ env, request, params }) => {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const player = await getCurrentPlayer(env, request);
  if (!player) return jsonResponse({ error: "unauthorized" }, { status: 401 });

  const commentId = parseId(params.id);
  if (!commentId) return jsonResponse({ error: "invalid_comment_id" }, { status: 400 });

  const comment = await env.DB.prepare(
    `
      SELECT id, targetType, targetId
      FROM content_comments
      WHERE id = ?
        AND deletedAt IS NULL
    `
  ).bind(commentId).first<CommentTargetRow>();
  if (!comment) return jsonResponse({ error: "not_found" }, { status: 404 });

  const input = await parseReactionInput(request);
  if ("response" in input) return input.response;

  const existing = await env.DB.prepare(
    `
      SELECT reaction
      FROM content_comment_reactions
      WHERE commentId = ?
        AND playerId = ?
        AND reaction = ?
    `
  ).bind(commentId, player.id, input.reaction).first<{ reaction: string }>();

  const selected = !existing;
  if (existing) {
    await env.DB.prepare(
      `
        DELETE FROM content_comment_reactions
        WHERE commentId = ?
          AND playerId = ?
          AND reaction = ?
      `
    ).bind(commentId, player.id, input.reaction).run();
  } else {
    await env.DB.prepare(
      `
        INSERT INTO content_comment_reactions (commentId, playerId, reaction)
        VALUES (?, ?, ?)
      `
    ).bind(commentId, player.id, input.reaction).run();
  }

  const reactionCounts = await loadReactionCounts(env, commentId);
  const myReactions = await loadMyReactions(env, commentId, player.id);

  await recordAuditLog(env, request, player, {
    action: selected ? "content_comment_reaction.add" : "content_comment_reaction.remove",
    resourceType: "content_comment",
    resourceId: commentId,
    details: {
      targetType: comment.targetType,
      targetId: comment.targetId,
      reaction: input.reaction,
    },
  });

  return jsonResponse({ reactionCounts, myReactions, selected });
};

export const onRequest: PagesFunction<AuthEnv> = async () => {
  return jsonResponse({ error: "method_not_allowed" }, { status: 405 });
};

async function parseReactionInput(
  request: Request
): Promise<{ reaction: string } | { response: Response }> {
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

  const reaction = typeof raw.reaction === "string" ? raw.reaction.trim() : "";
  if (!REACTIONS.includes(reaction as (typeof REACTIONS)[number])) {
    return { response: jsonResponse({ error: "invalid_reaction" }, { status: 400 }) };
  }

  return { reaction };
}

async function loadReactionCounts(
  env: AuthEnv,
  commentId: number
): Promise<Record<string, number>> {
  const { results } = await env.DB.prepare(
    `
      SELECT reaction, COUNT(*) AS count
      FROM content_comment_reactions
      WHERE commentId = ?
      GROUP BY reaction
    `
  ).bind(commentId).all<ReactionRow>();

  const counts: Record<string, number> = {};
  for (const row of results) {
    counts[row.reaction] = row.count;
  }
  return counts;
}

async function loadMyReactions(
  env: AuthEnv,
  commentId: number,
  playerId: number
): Promise<string[]> {
  const { results } = await env.DB.prepare(
    `
      SELECT reaction
      FROM content_comment_reactions
      WHERE commentId = ?
        AND playerId = ?
    `
  ).bind(commentId, playerId).all<{ reaction: string }>();

  return results.map((row) => row.reaction);
}

function parseId(value: string | string[] | undefined): number | null {
  const id = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
