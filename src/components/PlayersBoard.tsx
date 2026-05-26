import { useNavigate } from "react-router-dom";
import { PlayerImage } from "./shared/PlayerImage";
import { useCloudData } from "../hooks/useCloudData";
import { fetchPlayers, type Player } from "../api";

const POSITION_GROUPS: { label: string; group: Player["positionGroup"] }[] = [
  { label: "守门员", group: "goalkeeper" },
  { label: "后卫", group: "defender" },
  { label: "中场", group: "midfield" },
  { label: "前锋", group: "forward" },
];

export function PlayersBoard() {
  const navigate = useNavigate();
  const { data, loading, error } = useCloudData<Player[]>(fetchPlayers);

  if (loading) return <div className="p-8 text-gray-500">加载中...</div>;
  if (error) return <div className="p-8 text-red-500">数据加载失败</div>;

  const allPlayers = data ?? [];

  return (
    <div className="bg-white/80 p-4 rounded-lg">
      {POSITION_GROUPS.map(({ label, group }) => {
        const players = allPlayers.filter((p) => p.positionGroup === group);
        if (players.length === 0) return null;
        return (
          <div key={group} className="mb-10">
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">{label}</h2>
            <hr className="mb-6 border-gray-300" />
            <div className="overflow-x-auto">
              <table className="min-w-full text-center border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-gray-500 text-base">
                    <th className="px-2 py-1">位置</th>
                    <th className="px-2 py-1">号码</th>
                    <th className="px-2 py-1">头像</th>
                    <th className="px-2 py-1">姓名</th>
                    <th className="px-2 py-1">首发</th>
                    <th className="px-2 py-1">替补</th>
                    <th className="px-2 py-1">进球</th>
                    <th className="px-2 py-1">省份</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p) => (
                    <tr
                      key={p.name}
                      className="bg-gray-50 hover:bg-yellow-50 cursor-pointer"
                      onClick={() => navigate(`/player/${p.filename}`)}
                    >
                      <td className="px-2 py-1 text-gray-900">{p.position}</td>
                      <td className="px-2 py-1 text-gray-900">{p.number}</td>
                      <td className="px-2 py-1">
                        <PlayerImage filename={p.filename} />
                      </td>
                      <td className="px-2 py-1 text-gray-900">{p.name}</td>
                      <td className="px-2 py-1 text-gray-900">{p.starts ?? "--"}</td>
                      <td className="px-2 py-1 text-gray-900">{p.subs ?? "--"}</td>
                      <td className="px-2 py-1 text-gray-900">{p.goals ?? "--"}</td>
                      <td className="px-2 py-1 text-gray-900">{p.province ?? "--"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
