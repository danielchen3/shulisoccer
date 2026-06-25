import {
  getCurrentPlayer,
  jsonResponse,
  type AuthEnv,
} from "../../_lib/auth";

export const onRequestGet: PagesFunction<AuthEnv> = async ({ env, request }) => {
  const player = await getCurrentPlayer(env, request);
  if (!player) return jsonResponse({ error: "unauthorized" }, { status: 401 });
  if (player.role !== "admin") return jsonResponse({ error: "forbidden" }, { status: 403 });

  const url = new URL(request.url);
  const limit = clampInt(url.searchParams.get("limit"), 1, 100, 50);
  const offset = clampInt(url.searchParams.get("offset"), 0, 10000, 0);

  const { results } = await env.DB.prepare(
    `
      SELECT
        id,
        actorPlayerId,
        actorName,
        actorRole,
        action,
        resourceType,
        resourceId,
        details,
        ipAddress,
        userAgent,
        createdAt
      FROM audit_logs
      ORDER BY createdAt DESC, id DESC
      LIMIT ? OFFSET ?
    `
  ).bind(limit, offset).all();

  return jsonResponse({ auditLogs: results });
};

export const onRequest: PagesFunction<AuthEnv> = async () => {
  return jsonResponse({ error: "method_not_allowed" }, { status: 405 });
};

function clampInt(value: string | null, min: number, max: number, fallback: number): number {
  const number = value === null ? fallback : Number(value);
  if (!Number.isInteger(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}
