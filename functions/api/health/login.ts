import {
  createSession,
  deleteCurrentSession,
  findLoginPlayer,
  jsonResponse,
  recordAuditLog,
  verifyPassword,
  type AuthEnv,
} from "../../_lib/auth";

interface StepResult {
  ok: boolean;
  error?: string;
}

export const onRequestGet: PagesFunction<AuthEnv> = async ({ env, request }) => {
  const steps: Record<string, StepResult> = {};
  let playerId: number | null = null;

  try {
    const player = await findLoginPlayer(env, "ccx");
    playerId = player?.id ?? null;
    steps.findPlayer = {
      ok: Boolean(player),
      error: player ? undefined : "ccx_not_found",
    };

    steps.playerFields = {
      ok: Boolean(
        player &&
          player.username === "ccx" &&
          player.role === "admin" &&
          player.loginEnabled === 1 &&
          player.passwordHash
      ),
      error: player
        ? undefined
        : "missing_player",
    };

    if (!player) {
      return jsonResponse({ ok: false, playerId, steps });
    }

    try {
      const passwordOk = await verifyPassword("ccx_123", player.passwordHash);
      steps.verifyPassword = {
        ok: passwordOk,
        error: passwordOk ? undefined : "password_verification_failed",
      };
    } catch (error) {
      steps.verifyPassword = { ok: false, error: describeError(error) };
    }

    try {
      const session = await createSession(env, request, player.id);
      steps.createSession = { ok: Boolean(session.token && session.expiresAt) };
      await deleteCurrentSession(
        env,
        new Request(request.url, {
          headers: { cookie: `shuli_session=${session.token}` },
        })
      );
      steps.cleanupSession = { ok: true };
    } catch (error) {
      steps.createSession = { ok: false, error: describeError(error) };
    }

    try {
      await recordAuditLog(env, request, player, {
        action: "auth.debug",
        resourceType: "health_check",
        resourceId: player.id,
      });
      steps.recordAuditLog = { ok: true };
    } catch (error) {
      steps.recordAuditLog = { ok: false, error: describeError(error) };
    }

    const ok = Object.values(steps).every((step) => step.ok);
    return jsonResponse({ ok, playerId, steps });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        playerId,
        steps,
        error: describeError(error),
      },
      { status: 500 }
    );
  }
};

export const onRequest: PagesFunction<AuthEnv> = async () => {
  return jsonResponse({ error: "method_not_allowed" }, { status: 405 });
};

function describeError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return String(error);
}
