import { PlayerCard } from "./PlayerCard";
import { useCloudData } from "../hooks/useCloudData";
import { fetchRetiredPlayers, type RetiredPlayer } from "../api";

export function RetiredPlayersBoard() {
  const { data, loading, error } = useCloudData<RetiredPlayer[]>(fetchRetiredPlayers);

  if (loading) return <div className="p-8 text-gray-500">加载中...</div>;
  if (error) return <div className="p-8 text-red-500">数据加载失败</div>;

  const retired = data ?? [];

  return (
    <div className="bg-white/80">
      <hr className="mb-6 border-gray-300" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
        {retired.map((p) => (
          <PlayerCard key={p.name} {...p} />
        ))}
      </div>
    </div>
  );
}
