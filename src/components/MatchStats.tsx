import { useNavigate } from "react-router-dom";
import { PageHero } from "./shared/PageHero";
import { useCloudData } from "../hooks/useCloudData";
import { fetchMatchStats, type MatchGroup, type MatchEvent } from "../api";
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

export function MatchStats() {
  const { data, loading, error } = useCloudData<MatchGroup[]>(fetchMatchStats);
  const groups = data ?? [];

  return (
    <div>
      <PageHero
        eyebrow="Fixtures"
        title="Match Stats"
        subtitle="历届书院杯比赛战绩与精彩集锦。"
      />
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
        {loading && <div className="text-gray-500">加载中...</div>}
        {error && <div className="text-red-500">数据加载失败</div>}

        <div className="space-y-12">
          {groups.map((g, gi) => (
            <SeasonBlock key={g.year} group={g} groupIdx={gi} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SeasonBlock({ group, groupIdx }: { group: MatchGroup; groupIdx: number }) {
  return (
    <div>
      <div className="flex items-baseline gap-4 mb-6 border-b border-black/10 pb-3">
        <h2 className="font-display text-3xl sm:text-4xl uppercase">
          {group.year}
        </h2>
        {group.medal && (
          <span className="text-3xl" aria-hidden>
            {group.medal}
          </span>
        )}
        {group.video && (
          <a
            href={group.video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-700 hover:text-brand-500 transition-colors"
          >
            ▶ {group.video.label}
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {group.events.map((event, idx) => (
          <MatchRow key={event.round + idx} event={event} groupIdx={groupIdx} eventIdx={idx} />
        ))}
      </div>
    </div>
  );
}

function parseScore(score: string) {
  const penaltyMatch = score.match(/^(\d+)\s*:\s*(\d+)\s*\((\d+)\s*:\s*(\d+)\)$/);
  if (penaltyMatch) {
    return {
      left: penaltyMatch[1],
      right: penaltyMatch[2],
      penaltyLeft: penaltyMatch[3],
      penaltyRight: penaltyMatch[4],
    };
  }
  const parts = score.split(":").map((s) => s.trim());
  return { left: parts[0] ?? "0", right: parts[1] ?? "0" };
}

function TeamName({ name, side }: { name: string; side: "left" | "right" }) {
  const base = getBaseUrl();
  const logo = TEAM_LOGO[name];
  const isOurs = name === OUR_TEAM;

  const logoImg = logo && (
    <img
      src={`${base}${logo}`}
      alt=""
      className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0"
    />
  );

  return (
    <span className="inline-flex items-center gap-2">
      {side === "left" && logoImg}
      <span className={isOurs ? "text-brand-500 font-bold" : ""}>{name}</span>
      {side === "right" && logoImg}
    </span>
  );
}

function MatchRow({ event, groupIdx, eventIdx }: { event: MatchEvent; groupIdx: number; eventIdx: number }) {
  const navigate = useNavigate();
  const score = parseScore(event.score);

  return (
    <div
      className="bg-white border border-black/5 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/match/${groupIdx}/${eventIdx}`)}
    >
      <div className="p-4 grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-6">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-700 bg-brand-50 px-2 py-1 min-w-[88px] text-center">
          {event.round}
        </span>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex justify-end font-semibold text-ink truncate">
            <TeamName name={event.left} side="left" />
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 font-display text-2xl sm:text-3xl">
              <span>{score.left}</span>
              <span className="text-gray-300">:</span>
              <span>{score.right}</span>
            </div>
            {"penaltyLeft" in score && (
              <div className="text-xs text-gray-400 mt-0.5">
                (penalties {score.penaltyLeft} : {score.penaltyRight})
              </div>
            )}
          </div>
          <div className="flex justify-start font-semibold text-ink truncate">
            <TeamName name={event.right} side="right" />
          </div>
        </div>

        <div className="w-[100px] text-right">
          {event.video && (
            <a
              href={event.video.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-bold uppercase tracking-wider text-brand-700 hover:text-brand-500 transition-colors"
            >
              ▶ {event.video.label}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
