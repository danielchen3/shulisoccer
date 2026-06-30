interface Env { DB: D1Database }

export const onRequest: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    "SELECT * FROM retiredPlayers ORDER BY classYear DESC, id"
  ).all();
  return Response.json(results);
};
