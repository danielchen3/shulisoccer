import {
  getCurrentPlayer,
  jsonResponse,
  recordAuditLog,
  requireSameOrigin,
  type AuthPlayer,
  type AuthEnv,
} from "../../../_lib/auth";
import {
  invalidatePublicCache,
  type PublicCacheEnv,
} from "../../../_lib/publicCache";

type PatchableField = "date" | "content" | "image" | "body";

const PATCHABLE_FIELDS: PatchableField[] = ["date", "content", "image", "body"];
type AdminNewsEnv = AuthEnv & PublicCacheEnv;

export const onRequestPatch: PagesFunction<AdminNewsEnv> = async ({ env, request, params }) => {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const auth = await requireAdmin(env, request);
  if ("response" in auth) return auth.response;

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return jsonResponse({ error: "invalid_news_id" }, { status: 400 });
  }

  const patch = await parsePatchInput(request);
  if ("response" in patch) return patch.response;

  const existing = await env.DB.prepare(
    "SELECT id, date, content, image, body FROM news WHERE id = ?"
  ).bind(id).first();
  if (!existing) return jsonResponse({ error: "not_found" }, { status: 404 });

  const assignments = patch.fields.map((field) => `${field} = ?`).join(", ");
  await env.DB.prepare(`UPDATE news SET ${assignments} WHERE id = ?`)
    .bind(...patch.values, id)
    .run();

  const row = await env.DB.prepare(
    "SELECT id, date, content, image, body FROM news WHERE id = ?"
  ).bind(id).first();

  await recordAuditLog(env, request, auth.player, {
    action: "news.update",
    resourceType: "news",
    resourceId: id,
    details: { before: existing, after: row },
  });
  await invalidatePublicCache(env, ["news"]);

  return jsonResponse({ news: row });
};

export const onRequestDelete: PagesFunction<AdminNewsEnv> = async ({ env, request, params }) => {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const auth = await requireAdmin(env, request);
  if ("response" in auth) return auth.response;

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return jsonResponse({ error: "invalid_news_id" }, { status: 400 });
  }

  const existing = await env.DB.prepare(
    "SELECT id, date, content, image, body FROM news WHERE id = ?"
  ).bind(id).first();
  if (!existing) return jsonResponse({ error: "not_found" }, { status: 404 });

  await env.DB.prepare("DELETE FROM news WHERE id = ?").bind(id).run();
  await recordAuditLog(env, request, auth.player, {
    action: "news.delete",
    resourceType: "news",
    resourceId: id,
    details: { before: existing },
  });
  await invalidatePublicCache(env, ["news"]);
  return jsonResponse({ ok: true });
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

async function parsePatchInput(
  request: Request
): Promise<{ fields: PatchableField[]; values: (string | null)[] } | { response: Response }> {
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

  const fields: PatchableField[] = [];
  const values: (string | null)[] = [];

  for (const field of PATCHABLE_FIELDS) {
    if (!(field in body)) continue;

    const raw = body[field];
    if (raw !== null && typeof raw !== "string") {
      return { response: jsonResponse({ error: "invalid_field_type" }, { status: 400 }) };
    }

    const value = typeof raw === "string" ? raw.trim() : null;
    if ((field === "date" || field === "content") && !value) {
      return { response: jsonResponse({ error: "date_and_content_required" }, { status: 400 }) };
    }

    if (
      (field === "date" && (value?.length ?? 0) > 32) ||
      (field === "content" && (value?.length ?? 0) > 500) ||
      (field === "image" && (value?.length ?? 0) > 1000)
    ) {
      return { response: jsonResponse({ error: "field_too_long" }, { status: 400 }) };
    }

    fields.push(field);
    values.push(value || null);
  }

  if (fields.length === 0) {
    return { response: jsonResponse({ error: "no_fields_to_update" }, { status: 400 }) };
  }

  return { fields, values };
}
