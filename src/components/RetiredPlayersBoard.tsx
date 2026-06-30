import { PageHero } from "./shared/PageHero";
import { useCloudData } from "../hooks/useCloudData";
import { fetchRetiredPlayers, type RetiredPlayer } from "../api";

export function RetiredPlayersBoard() {
  const { data, loading, error } = useCloudData<RetiredPlayer[]>(fetchRetiredPlayers);
  const retired = data ?? [];

  return (
    <div>
      <PageHero
        eyebrow="Honour Roll"
        title="Legends"
        subtitle="历届为树礼书院征战过的老队员，他们的精神延续在球队的每一场比赛。"
      />
      <section className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
        {loading && <div className="text-gray-500">加载中...</div>}
        {error && <div className="text-red-500">数据加载失败</div>}

        <div className="divide-y divide-black/5">
          {retired.map((p, idx) => (
            <LegendRow key={p.name} player={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

function LegendRow({ player }: { player: RetiredPlayer }) {
  const tags = [
    player.position,
    player.height ? `${player.height}cm` : null,
    player.province ?? null,
  ].filter(Boolean);

  return (
    <div className="flex items-center gap-4 sm:gap-6 py-4 group hover:bg-paper-2/60 transition-colors -mx-3 px-3 rounded">
      <span className="font-display text-2xl text-black/10 w-10 text-right shrink-0">
        {player.number != null ? `#${player.number}` : "—"}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="font-display text-lg sm:text-xl uppercase truncate">
            {player.name}
          </span>
          {player.classYear && (
            <span className="text-xs text-gray-400 font-mono shrink-0">
              {player.classYear}级
            </span>
          )}
          {player.goals !== undefined && player.goals > 0 && (
            <span className="text-xs text-brand-600 font-bold shrink-0">
              {player.goals} goals
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {tags.map((t) => (
            <span
              key={t}
              className="text-[10px] text-gray-400 uppercase tracking-widest"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
