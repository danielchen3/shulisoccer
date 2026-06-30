interface Env { DB: D1Database }

interface MatchRow {
  id: number;
  sortOrder: number;
  year: string;
  medal: string | null;
  videoLabel: string | null;
  videoUrl: string | null;
  events: string;
}

export const onRequest: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    "SELECT * FROM matchStats ORDER BY sortOrder ASC"
  ).all<MatchRow>();

  const groups = results.map((row) => ({
    year: row.year,
    medal: row.medal ?? undefined,
    video: row.videoUrl ? { label: row.videoLabel!, url: row.videoUrl } : undefined,
    events: (JSON.parse(row.events) as Array<{
      round: string; left: string; score: string; right: string;
      video?: { label: string; url: string };
      videoLabel?: string; videoUrl?: string;
      goals?: Array<{ minute: number; player: string; type: string }>;
      starters?: string[];
      timeline?: Array<{
        type: "goal" | "substitution" | "yellow_card" | "red_card" | "half_time";
        minute?: number;
        side?: "left" | "right";
        team?: string;
        player?: string;
        playerIn?: string;
        playerOut?: string;
        playersIn?: string[];
        playersOut?: string[];
        score?: string;
        detail?: string;
      }>;
    }>).map((e) => ({
      round: e.round,
      left: e.left,
      score: e.score,
      right: e.right,
      video: e.video ?? (e.videoUrl ? { label: e.videoLabel!, url: e.videoUrl } : undefined),
      goals: e.goals,
      starters: e.starters,
      timeline: e.timeline,
    })),
  }));

  return Response.json(groups);
};
