import { PlayerCard } from "./PlayerCard";
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
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
        {loading && <div className="text-gray-500">加载中...</div>}
        {error && <div className="text-red-500">数据加载失败</div>}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
          {retired.map((p) => (
            <PlayerCard key={p.name} {...p} />
          ))}
        </div>
      </section>
    </div>
  );
}
