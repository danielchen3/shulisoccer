import {
  deleteCurrentSession,
  expiredSessionCookie,
  getCurrentPlayer,
  jsonResponse,
  recordAuditLog,
  requireSameOrigin,
  type AuthEnv,
} from "../../_lib/auth";

export const onRequestPost: PagesFunction<AuthEnv> = async ({ env, request }) => {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const player = await getCurrentPlayer(env, request);
  await deleteCurrentSession(env, request);
  if (player) {
    await recordAuditLog(env, request, player, {
      action: "auth.logout",
      resourceType: "session",
      resourceId: player.id,
      details: { username: player.username },
    });
  }

  return jsonResponse(
    { ok: true },
    {
      headers: {
        "set-cookie": expiredSessionCookie(request.url),
      },
    }
  );
};

export const onRequest: PagesFunction<AuthEnv> = async () => {
  return jsonResponse({ error: "method_not_allowed" }, { status: 405 });
};
