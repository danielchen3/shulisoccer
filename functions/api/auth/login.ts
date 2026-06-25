import {
  createSession,
  findLoginPlayer,
  jsonResponse,
  publicPlayer,
  readJsonObject,
  recordAuditLog,
  requireSameOrigin,
  sessionCookie,
  verifyPassword,
  type AuthEnv,
} from "../../_lib/auth";

export const onRequestPost: PagesFunction<AuthEnv> = async ({ env, request }) => {
  try {
    const originError = requireSameOrigin(request);
    if (originError) return originError;

    let body: Record<string, unknown>;
    try {
      body = await readJsonObject(request);
    } catch (response) {
      return response as Response;
    }

    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!username || !password) {
      return jsonResponse({ error: "missing_credentials" }, { status: 400 });
    }

    const player = await findLoginPlayer(env, username);
    const passwordOk = player
      ? await verifyPassword(password, player.passwordHash)
      : false;

    if (!player || player.loginEnabled !== 1 || !passwordOk) {
      return jsonResponse({ error: "invalid_credentials" }, { status: 401 });
    }

    const session = await createSession(env, request, player.id);
    await recordAuditLog(env, request, player, {
      action: "auth.login",
      resourceType: "session",
      resourceId: player.id,
      details: { username: player.username },
    });

    return jsonResponse(
      {
        player: publicPlayer(player),
        expiresAt: session.expiresAt,
      },
      {
        headers: {
          "set-cookie": sessionCookie(session.token, request.url),
        },
      },
    );
  } catch (error) {
    console.error("auth.login failed", error);
    return jsonResponse({ error: "login_server_error" }, { status: 500 });
  }
};

export const onRequest: PagesFunction<AuthEnv> = async () => {
  return jsonResponse({ error: "method_not_allowed" }, { status: 405 });
};
