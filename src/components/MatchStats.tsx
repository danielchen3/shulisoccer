import { PageHero } from "./shared/PageHero";
import { useCloudData } from "../hooks/useCloudData";
import { fetchMatchStats, type MatchGroup, type MatchEvent } from "../api";

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
          {groups.map((g) => (
            <SeasonBlock key={g.year} group={g} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SeasonBlock({ group }: { group: MatchGroup }) {
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
          <MatchRow key={event.round + idx} event={event} />
        ))}
      </div>
    </div>
  );
}

function MatchRow({ event }: { event: MatchEvent }) {
  const [leftScore, rightScore] = event.score.split(":").map((s) => s.trim());

  return (
    <div className="bg-white border border-black/5 hover:shadow-md transition-shadow">
      <div className="p-4 flex items-center gap-3 sm:gap-6 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-700 bg-brand-50 px-2 py-1 min-w-[88px] text-center">
          {event.round}
        </span>

        <div className="flex-1 grid grid-cols-3 items-center gap-2 min-w-[280px]">
          <div className="text-right font-semibold text-ink truncate">{event.left}</div>
          <div className="flex items-center justify-center gap-2 font-display text-2xl sm:text-3xl">
            <span>{leftScore}</span>
            <span className="text-gray-300">:</span>
            <span>{rightScore}</span>
          </div>
          <div className="text-left font-semibold text-ink truncate">{event.right}</div>
        </div>

        {event.video && (
          <a
            href={event.video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold uppercase tracking-wider text-brand-700 hover:text-brand-500 transition-colors ml-auto"
          >
            ▶ {event.video.label}
          </a>
        )}
      </div>
    </div>
  );
}
