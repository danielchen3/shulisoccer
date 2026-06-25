import {
  cachedJsonResponse,
  readPublicCache,
  writePublicCache,
  type PublicCacheEnv,
} from "../_lib/publicCache";

export const onRequest: PagesFunction<PublicCacheEnv> = async ({ env }) => {
  const cached = await readPublicCache(env, "news");
  if (cached) return cachedJsonResponse(cached, "HIT");

  const { results } = await env.DB.prepare(
    "SELECT * FROM news ORDER BY date DESC"
  ).all();

  await writePublicCache(env, "news", results);
  return cachedJsonResponse(results, env.PUBLIC_CACHE ? "MISS" : "BYPASS");
};
