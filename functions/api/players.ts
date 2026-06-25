import {
  cachedJsonResponse,
  readPublicCache,
  writePublicCache,
  type PublicCacheEnv,
} from "../_lib/publicCache";

export const onRequest: PagesFunction<PublicCacheEnv> = async ({ env }) => {
  const cached = await readPublicCache(env, "players");
  if (cached) return cachedJsonResponse(cached, "HIT");

  const { results } = await env.DB.prepare(
    `
      SELECT
        id,
        positionGroup,
        position,
        number,
        filename,
        name,
        enName,
        club,
        nationality,
        nationalityFlag,
        province,
        age,
        birthday,
        height,
        weight,
        foot,
        starts,
        subs,
        goals
      FROM players
      ORDER BY positionGroup, number
    `
  ).all();

  await writePublicCache(env, "players", results);
  return cachedJsonResponse(results, env.PUBLIC_CACHE ? "MISS" : "BYPASS");
};
