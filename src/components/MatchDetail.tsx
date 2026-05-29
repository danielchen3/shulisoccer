import { Link, useParams } from "react-router-dom";
import { useCloudData } from "../hooks/useCloudData";
import { fetchMatchStats, type MatchGroup, type MatchGoal } from "../api";
import { getBaseUrl } from "../utils/baseUrl";

const TEAM_LOGO: Record<string, string> = {
  "树礼书院": "assets/logo.png",
  "致诚书院": "assets/Team/zhicheng.jpg",
  "致仁书院": "assets/Team/zhiren.jpg",
  "致新书院": "assets/Team/zhixin.jpg",
  "树仁书院": "assets/Team/shuren.jpg",
  "树德书院": "assets/Team/shude.jpg",
};

const OUR_TEAM = "树礼书院";

function parseScore(score: string) {
  const m = score.match(/^(\d+)\s*:\s*(\d+)\s*(?:\((\d+)\s*:\s*(\d+)\))?$/);
  if (!m) return { left: "0", right: "0" };
  return {
    left: m[1],
    right: m[2],
    penaltyLeft: m[3],
    penaltyRight: m[4],
  };
}

export function MatchDetail() {
  const { groupIdx, eventIdx } = useParams();
  const base = getBaseUrl();
  const { data, loading, error } = useCloudData<MatchGroup[]>(fetchMatchStats);

  if (loading) return <PageMsg>加载中...</PageMsg>;
  if (error) return <PageMsg className="text-red-400">数据加载失败</PageMsg>;

  const groups = data ?? [];
  const gi = Number(groupIdx);
  const ei = Number(eventIdx);
  const group = groups[gi];
  const event = group?.events[ei];

  if (!group || !event) return <PageMsg>未找到该比赛</PageMsg>;

  const score = parseScore(event.score);
  const hasGoals = event.goals && event.goals.length > 0;

  const regularGoals = event.goals?.filter((g) => g.type === "goal") ?? [];
  const penaltyGoals = event.goals?.filter((g) => g.type === "penalty") ?? [];

  return (
    <div>
      {/* Hero */}
      <section className="bg-ink text-white">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
          <Link
            to="/matches"
            className="text-xs text-white/60 hover:text-white uppercase tracking-widest inline-flex items-center gap-2 mb-6"
          >
            ← Back to Matches
          </Link>

          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-brand-400 text-xs font-bold uppercase tracking-[0.3em]">
              {group.year}
            </span>
            {group.medal && <span className="text-xl">{group.medal}</span>}
          </div>
          <div className="text-center text-white/50 text-xs uppercase tracking-widest mb-6">
            {event.round}
          </div>

          {/* Scoreboard */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mb-2">
            <TeamBadge name={event.left} base={base} />
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3 font-display text-4xl sm:text-5xl lg:text-6xl">
                <span>{score.left}</span>
                <span className="text-white/30">:</span>
                <span>{score.right}</span>
              </div>
              {score.penaltyLeft && (
                <div className="text-xs text-white/40 mt-1">
                  penalties {score.penaltyLeft} : {score.penaltyRight}
                </div>
              )}
            </div>
            <TeamBadge name={event.right} base={base} />
          </div>

          {event.video && (
            <div className="text-center mt-4">
              <a
                href={event.video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-400 hover:text-brand-300 transition-colors"
              >
                ▶ {event.video.label}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-[700px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
        <span className="block text-brand-600 text-xs font-bold uppercase tracking-[0.3em] mb-2">
          ▍ Timeline
        </span>
        <h2 className="font-display text-2xl sm:text-3xl uppercase mb-8">
          Match Events
        </h2>

        {!hasGoals ? (
          <div className="text-gray-400 text-sm py-8 text-center border border-dashed border-gray-200 rounded-lg">
            暂无数据
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[23px] top-2 bottom-2 w-px bg-black/10" />

            <div className="space-y-0">
              {regularGoals.map((goal, idx) => (
                <GoalEvent key={`g-${idx}`} goal={goal} />
              ))}

              {penaltyGoals.length > 0 && (
                <>
                  <div className="relative flex items-center gap-4 py-4 pl-[48px]">
                    <div className="absolute left-[17px] w-[13px] h-[13px] rounded-full bg-brand-500 border-2 border-white ring-1 ring-brand-500" />
                    <span className="font-display text-sm uppercase tracking-wider text-brand-600">
                      Penalty Shootout
                    </span>
                    {score.penaltyLeft && (
                      <span className="text-xs text-gray-400">
                        ({score.penaltyLeft} : {score.penaltyRight})
                      </span>
                    )}
                  </div>
                  {penaltyGoals.map((goal, idx) => (
                    <GoalEvent key={`p-${idx}`} goal={goal} isPenalty />
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function TeamBadge({ name, base }: { name: string; base: string }) {
  const logo = TEAM_LOGO[name];
  const isOurs = name === OUR_TEAM;

  return (
    <div className="flex flex-col items-center gap-2 min-w-[80px]">
      {logo && (
        <img
          src={`${base}${logo}`}
          alt=""
          className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
        />
      )}
      <span
        className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${
          isOurs ? "text-brand-400" : "text-white/70"
        }`}
      >
        {name}
      </span>
    </div>
  );
}

function GoalEvent({ goal, isPenalty }: { goal: MatchGoal; isPenalty?: boolean }) {
  return (
    <div className="relative flex items-center gap-4 py-3 pl-[48px] group">
      {/* Dot on the timeline */}
      <div className="absolute left-[19px] w-[9px] h-[9px] rounded-full bg-white border-2 border-gray-300 group-hover:border-brand-500 transition-colors" />

      {/* Minute */}
      {!isPenalty ? (
        <span className="font-display text-lg text-brand-500 w-[40px] shrink-0">
          {goal.minute}'
        </span>
      ) : (
        <span className="w-[40px] shrink-0 text-center text-xs text-gray-300">
          PEN
        </span>
      )}

      {/* Icon */}
      <span className="text-lg shrink-0">⚽</span>

      {/* Player name */}
      <span className="font-semibold text-ink">{goal.player}</span>
    </div>
  );
}

function PageMsg({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-10 py-24 text-center">
      <p className={`text-gray-500 ${className}`}>{children}</p>
    </div>
  );
}
