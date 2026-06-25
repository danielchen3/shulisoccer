import {
  getCurrentPlayer,
  jsonResponse,
  publicPlayer,
  type AuthEnv,
} from "../../_lib/auth";

export const onRequestGet: PagesFunction<AuthEnv> = async ({ env, request }) => {
  const player = await getCurrentPlayer(env, request);
  return jsonResponse({ player: player ? publicPlayer(player) : null });
};

export const onRequest: PagesFunction<AuthEnv> = async () => {
  return jsonResponse({ error: "method_not_allowed" }, { status: 405 });
};
