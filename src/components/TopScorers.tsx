import { PageHero } from "./shared/PageHero";
import { useCloudData } from "../hooks/useCloudData";
import { fetchTopScorers, type TopScorer } from "../api";

const MEDALS = ["🥇", "🥈", "🥉"];

export function TopScorers() {
  const { data, loading, error } = useCloudData<TopScorer[]>(fetchTopScorers);
  const sorted = [...(data ?? [])].sort((a, b) => b.goals - a.goals);

  let lastGoals: number | null = null;
  let displayedRank = 0;
  let realRank = 0;
  const maxGoals = sorted[0]?.goals ?? 0;

  return (
    <div>
      <PageHero
        eyebrow="Statistics"
        title="Top Scorers"
        subtitle="树礼书院足球队历史进球榜，铭记每一粒进球。"
      />
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
        {loading && <div className="text-gray-500">加载中...</div>}
        {error && <div className="text-red-500">数据加载失败</div>}

        <div className="bg-white border border-black/5 overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-3 bg-ink text-white text-[10px] font-bold uppercase tracking-widest">
            <div className="col-span-2">Rank</div>
            <div className="col-span-6">Player</div>
            <div className="col-span-4 text-right">Goals</div>
          </div>
          {sorted.map((s, idx) => {
            realRank++;
            if (s.goals !== lastGoals) {
              displayedRank = realRank;
              lastGoals = s.goals;
            }
            const isPodium = displayedRank <= 3;
            return (
              <div
                key={s.name + idx}
                className={[
                  "grid grid-cols-12 px-4 py-3 items-center border-b last:border-0 border-black/5",
                  isPodium ? "bg-brand-50" : "bg-white hover:bg-paper-2",
                ].join(" ")}
              >
                <div className="col-span-2 flex items-center gap-2">
                  <span className="font-display text-xl w-6 text-center">
                    {isPodium ? MEDALS[displayedRank - 1] : displayedRank}
                  </span>
                </div>
                <div className="col-span-6 font-semibold text-ink truncate">
                  {s.name}
                </div>
                <div className="col-span-4 flex items-center justify-end gap-3">
                  <div className="hidden sm:block flex-1 max-w-[200px] h-2 bg-black/5 overflow-hidden">
                    <div
                      className="h-full bg-brand-500"
                      style={{ width: `${(s.goals / Math.max(maxGoals, 1)) * 100}%` }}
                    />
                  </div>
                  <span className="font-display text-2xl w-10 text-right">{s.goals}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
