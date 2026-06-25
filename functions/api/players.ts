interface Env { DB: D1Database }

export const onRequest: PagesFunction<Env> = async ({ env }) => {
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
  return Response.json(results);
};
