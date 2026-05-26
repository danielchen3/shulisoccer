interface Env { DB: D1Database }

export const onRequest: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    "SELECT * FROM players ORDER BY positionGroup, number"
  ).all();
  return Response.json(results);
};
