interface Env { DB: D1Database }

export const onRequest: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    "SELECT * FROM topScorers ORDER BY goals DESC"
  ).all();
  return Response.json(results);
};
