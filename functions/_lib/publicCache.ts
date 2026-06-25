export interface PublicCacheEnv {
  DB: D1Database;
  PUBLIC_CACHE?: KVNamespace;
}

type PublicCacheResource = "players" | "news";

const CACHE_TTL_SECONDS = 300;
const CACHE_KEYS: Record<PublicCacheResource, string> = {
  players: "public:players:v1",
  news: "public:news:v1",
};

export async function readPublicCache<T>(
  env: PublicCacheEnv,
  resource: PublicCacheResource
): Promise<T | null> {
  if (!env.PUBLIC_CACHE) return null;

  try {
    return await env.PUBLIC_CACHE.get<T>(CACHE_KEYS[resource], "json");
  } catch (error) {
    console.error(`failed to read ${resource} public cache`, error);
    return null;
  }
}

export async function writePublicCache(
  env: PublicCacheEnv,
  resource: PublicCacheResource,
  value: unknown
): Promise<void> {
  if (!env.PUBLIC_CACHE) return;

  try {
    await env.PUBLIC_CACHE.put(CACHE_KEYS[resource], JSON.stringify(value), {
      expirationTtl: CACHE_TTL_SECONDS,
    });
  } catch (error) {
    console.error(`failed to write ${resource} public cache`, error);
  }
}

export async function invalidatePublicCache(
  env: PublicCacheEnv,
  resources: PublicCacheResource[]
): Promise<void> {
  if (!env.PUBLIC_CACHE) return;

  await Promise.all(resources.map(async (resource) => {
    try {
      await env.PUBLIC_CACHE?.delete(CACHE_KEYS[resource]);
    } catch (error) {
      console.error(`failed to invalidate ${resource} public cache`, error);
    }
  }));
}

export function cachedJsonResponse(body: unknown, cacheStatus: "HIT" | "MISS" | "BYPASS"): Response {
  return Response.json(body, {
    headers: {
      "cache-control": "public, max-age=60",
      "x-edge-cache": cacheStatus,
    },
  });
}
