interface Env { DB: D1Database }

export const onRequest: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(`
    SELECT name, goals FROM players WHERE goals > 0
    UNION ALL
    SELECT name, goals FROM retiredPlayers WHERE goals > 0
    ORDER BY goals DESC
  `).all();
  return Response.json(results);
};
