import {
  getCurrentPlayer,
  jsonResponse,
  recordAuditLog,
  requireSameOrigin,
  type AuthEnv,
  type AuthPlayer,
} from "../_lib/auth";

const TARGET_TYPES = ["news", "match"] as const;

interface CommentRow {
  id: number;
  targetType: string;
  targetId: string;
  parentCommentId: number | null;
  body: string;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  authorName: string;
  authorFilename: string;
  authorRole: string;
}

interface ReactionRow {
  commentId: number;
  reaction: string;
  count: number;
}

interface MyReactionRow {
  commentId: number;
  reaction: string;
}

export const onRequestGet: PagesFunction<AuthEnv> = async ({ env, request }) => {
  const url = new URL(request.url);
  const target = parseTarget(url.searchParams.get("targetType"), url.searchParams.get("targetId"));
  if ("response" in target) return target.response;

  const player = await getCurrentPlayer(env, request);
  const { results: commentRows } = await env.DB.prepare(
    `
      SELECT
        c.id,
        c.targetType,
        c.targetId,
        c.parentCommentId,
        c.body,
        c.createdAt,
        c.updatedAt,
        p.id AS authorId,
        p.name AS authorName,
        p.filename AS authorFilename,
        p.role AS authorRole
      FROM content_comments c
      JOIN players p ON p.id = c.authorPlayerId
      WHERE c.targetType = ?
        AND c.targetId = ?
        AND c.deletedAt IS NULL
      ORDER BY c.createdAt ASC, c.id ASC
    `
  ).bind(target.targetType, target.targetId).all<CommentRow>();

  const commentIds = commentRows.map((comment) => comment.id);
  const reactionCounts = await loadReactionCounts(env, commentIds);
  const myReactions = player ? await loadMyReactions(env, commentIds, player.id) : new Map<number, string[]>();

  return jsonResponse({
    comments: commentRows.map((comment) => ({
      ...comment,
      reactionCounts: reactionCounts.get(comment.id) ?? {},
      myReactions: myReactions.get(comment.id) ?? [],
    })),
  });
};

export const onRequestPost: PagesFunction<AuthEnv> = async ({ env, request }) => {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const player = await getCurrentPlayer(env, request);
  if (!player) return jsonResponse({ error: "unauthorized" }, { status: 401 });

  const input = await parseCreateInput(env, request);
  if ("response" in input) return input.response;

  const result = await env.DB.prepare(
    `
      INSERT INTO content_comments
        (targetType, targetId, parentCommentId, authorPlayerId, body)
      VALUES (?, ?, ?, ?, ?)
    `
  ).bind(
    input.targetType,
    input.targetId,
    input.parentCommentId,
    player.id,
    input.body
  ).run();

  const comment = await getComment(env, result.meta.last_row_id);
  await recordAuditLog(env, request, player, {
    action: "content_comment.create",
    resourceType: "content_comment",
    resourceId: result.meta.last_row_id,
    details: {
      targetType: input.targetType,
      targetId: input.targetId,
      parentCommentId: input.parentCommentId,
    },
  });

  return jsonResponse({
    comment: comment ? { ...comment, reactionCounts: {}, myReactions: [] } : null,
  }, { status: 201 });
};

export const onRequest: PagesFunction<AuthEnv> = async () => {
  return jsonResponse({ error: "method_not_allowed" }, { status: 405 });
};

async function parseCreateInput(
  env: AuthEnv,
  request: Request
): Promise<{
  targetType: string;
  targetId: string;
  parentCommentId: number | null;
  body: string;
} | { response: Response }> {
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

  const target = parseTarget(raw.targetType, raw.targetId);
  if ("response" in target) return target;

  const commentBody = typeof raw.body === "string" ? raw.body.trim() : "";
  if (!commentBody || commentBody.length > 2000) {
    return { response: jsonResponse({ error: "invalid_body" }, { status: 400 }) };
  }

  const parentCommentId = raw.parentCommentId == null ? null : Number(raw.parentCommentId);
  if (parentCommentId !== null) {
    if (!Number.isInteger(parentCommentId) || parentCommentId <= 0) {
      return { response: jsonResponse({ error: "invalid_parent_comment_id" }, { status: 400 }) };
    }

    const parent = await env.DB.prepare(
      `
        SELECT id
        FROM content_comments
        WHERE id = ?
          AND targetType = ?
          AND targetId = ?
          AND deletedAt IS NULL
      `
    ).bind(parentCommentId, target.targetType, target.targetId).first<{ id: number }>();
    if (!parent) {
      return { response: jsonResponse({ error: "parent_comment_not_found" }, { status: 404 }) };
    }
  }

  return {
    targetType: target.targetType,
    targetId: target.targetId,
    parentCommentId,
    body: commentBody,
  };
}

function parseTarget(
  targetTypeRaw: unknown,
  targetIdRaw: unknown
): { targetType: string; targetId: string } | { response: Response } {
  const targetType = typeof targetTypeRaw === "string" ? targetTypeRaw.trim() : "";
  const targetId = typeof targetIdRaw === "string" ? targetIdRaw.trim() : "";

  if (!TARGET_TYPES.includes(targetType as (typeof TARGET_TYPES)[number])) {
    return { response: jsonResponse({ error: "invalid_target_type" }, { status: 400 }) };
  }
  if (!targetId || targetId.length > 160) {
    return { response: jsonResponse({ error: "invalid_target_id" }, { status: 400 }) };
  }

  return { targetType, targetId };
}

async function getComment(env: AuthEnv, id: number): Promise<CommentRow | null> {
  return env.DB.prepare(
    `
      SELECT
        c.id,
        c.targetType,
        c.targetId,
        c.parentCommentId,
        c.body,
        c.createdAt,
        c.updatedAt,
        p.id AS authorId,
        p.name AS authorName,
        p.filename AS authorFilename,
        p.role AS authorRole
      FROM content_comments c
      JOIN players p ON p.id = c.authorPlayerId
      WHERE c.id = ?
        AND c.deletedAt IS NULL
    `
  ).bind(id).first<CommentRow>();
}

async function loadReactionCounts(
  env: AuthEnv,
  commentIds: number[]
): Promise<Map<number, Record<string, number>>> {
  const counts = new Map<number, Record<string, number>>();
  if (commentIds.length === 0) return counts;

  const placeholders = commentIds.map(() => "?").join(", ");
  const { results } = await env.DB.prepare(
    `
      SELECT commentId, reaction, COUNT(*) AS count
      FROM content_comment_reactions
      WHERE commentId IN (${placeholders})
      GROUP BY commentId, reaction
    `
  ).bind(...commentIds).all<ReactionRow>();

  for (const row of results) {
    const current = counts.get(row.commentId) ?? {};
    current[row.reaction] = row.count;
    counts.set(row.commentId, current);
  }

  return counts;
}

async function loadMyReactions(
  env: AuthEnv,
  commentIds: number[],
  playerId: number
): Promise<Map<number, string[]>> {
  const reactions = new Map<number, string[]>();
  if (commentIds.length === 0) return reactions;

  const placeholders = commentIds.map(() => "?").join(", ");
  const { results } = await env.DB.prepare(
    `
      SELECT commentId, reaction
      FROM content_comment_reactions
      WHERE playerId = ?
        AND commentId IN (${placeholders})
    `
  ).bind(playerId, ...commentIds).all<MyReactionRow>();

  for (const row of results) {
    const current = reactions.get(row.commentId) ?? [];
    current.push(row.reaction);
    reactions.set(row.commentId, current);
  }

  return reactions;
}
