import {
  getCurrentPlayer,
  jsonResponse,
  recordAuditLog,
  requireSameOrigin,
  type AuthPlayer,
  type AuthEnv,
} from "../../_lib/auth";
import {
  invalidatePublicCache,
  type PublicCacheEnv,
} from "../../_lib/publicCache";

interface NewsInput {
  date: string;
  content: string;
  image: string | null;
  body: string | null;
}

type AdminNewsEnv = AuthEnv & PublicCacheEnv;

export const onRequestGet: PagesFunction<AdminNewsEnv> = async ({ env, request }) => {
  const auth = await requireAdmin(env, request);
  if ("response" in auth) return auth.response;

  const { results } = await env.DB.prepare(
    "SELECT id, date, content, image, body FROM news ORDER BY date DESC, id DESC"
  ).all();

  return jsonResponse({ news: results });
};

export const onRequestPost: PagesFunction<AdminNewsEnv> = async ({ env, request }) => {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const auth = await requireAdmin(env, request);
  if ("response" in auth) return auth.response;

  const input = await parseNewsInput(request);
  if ("response" in input) return input.response;

  const result = await env.DB.prepare(
    "INSERT INTO news (date, content, image, body) VALUES (?, ?, ?, ?)"
  ).bind(input.date, input.content, input.image, input.body).run();

  const id = result.meta.last_row_id;
  const row = await env.DB.prepare(
    "SELECT id, date, content, image, body FROM news WHERE id = ?"
  ).bind(id).first();

  await recordAuditLog(env, request, auth.player, {
    action: "news.create",
    resourceType: "news",
    resourceId: id,
    details: { after: row },
  });
  await invalidatePublicCache(env, ["news"]);

  return jsonResponse({ news: row }, { status: 201 });
};

export const onRequest: PagesFunction<AdminNewsEnv> = async () => {
  return jsonResponse({ error: "method_not_allowed" }, { status: 405 });
};

async function requireAdmin(
  env: AdminNewsEnv,
  request: Request
): Promise<{ player: AuthPlayer } | { response: Response }> {
  const player = await getCurrentPlayer(env, request);
  if (!player) return { response: jsonResponse({ error: "unauthorized" }, { status: 401 }) };
  if (player.role !== "admin") {
    return { response: jsonResponse({ error: "forbidden" }, { status: 403 }) };
  }
  return { player };
}

async function parseNewsInput(
  request: Request
): Promise<NewsInput | { response: Response }> {
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

  const date = typeof body.date === "string" ? body.date.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const image = typeof body.image === "string" && body.image.trim()
    ? body.image.trim()
    : null;
  const newsBody = typeof body.body === "string" && body.body.trim()
    ? body.body.trim()
    : null;

  if (!date || !content) {
    return { response: jsonResponse({ error: "date_and_content_required" }, { status: 400 }) };
  }

  if (date.length > 32 || content.length > 500 || (image?.length ?? 0) > 1000) {
    return { response: jsonResponse({ error: "field_too_long" }, { status: 400 }) };
  }

  return { date, content, image, body: newsBody };
}
