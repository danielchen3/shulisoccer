import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayerImage } from "./shared/PlayerImage";
import { useCloudData } from "../hooks/useCloudData";
import { fetchPlayers, type Player } from "../api";

const POSITION_GROUPS: { label: string; en: string; group: Player["positionGroup"] }[] = [
  { label: "守门员", en: "Goalkeepers", group: "goalkeeper" },
  { label: "后卫",   en: "Defenders",   group: "defender" },
  { label: "中场",   en: "Midfielders", group: "midfield" },
  { label: "前锋",   en: "Forwards",    group: "forward" },
];

const FILTER_TABS = [
  { label: "All",         value: "all"  as const },
  { label: "Goalkeeper",  value: "goalkeeper" as const },
  { label: "Defender",    value: "defender"   as const },
  { label: "Midfielder",  value: "midfield"   as const },
  { label: "Forward",     value: "forward"    as const },
];

type FilterValue = (typeof FILTER_TABS)[number]["value"];

export function PlayersBoard() {
  const { data, loading, error } = useCloudData<Player[]>(fetchPlayers);
  const [filter, setFilter] = useState<FilterValue>("all");

  const allPlayers = data ?? [];

  return (
    <div>
      {/* Page hero */}
      <section className="bg-ink text-white py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <span className="block text-brand-400 text-xs font-bold uppercase tracking-[0.3em] mb-3">
            ▍ Squad
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase">
            First Team
          </h1>
          <p className="text-white/60 mt-3 max-w-2xl">
            点击球员卡片查看个人资料、出场和进球数据。
          </p>
        </div>
      </section>

      {/* Filter tabs */}
      <div className="bg-white border-b border-black/10 sticky top-16 z-30">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 flex gap-1 overflow-x-auto scrollbar-thin">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={[
                "relative px-5 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors",
                filter === tab.value
                  ? "text-ink"
                  : "text-gray-400 hover:text-ink",
              ].join(" ")}
            >
              {tab.label}
              {filter === tab.value && (
                <span className="absolute left-3 right-3 bottom-0 h-1 bg-brand-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
        {loading && <div className="text-gray-500 py-12">加载中...</div>}
        {error && <div className="text-red-500 py-12">数据加载失败</div>}

        {POSITION_GROUPS.filter((g) => filter === "all" || filter === g.group).map(
          ({ label, en, group }) => {
            const players = allPlayers.filter((p) => p.positionGroup === group);
            if (players.length === 0) return null;
            return (
              <div key={group} className="mb-14 last:mb-0">
                <div className="flex items-baseline gap-4 mb-6">
                  <h2 className="font-display text-2xl sm:text-3xl uppercase">{en}</h2>
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-xs text-gray-400 ml-auto">{players.length} players</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6 lg:gap-9">
                  {players.map((p) => (
                    <PlayerTile key={p.filename} player={p} />
                  ))}
                </div>
              </div>
            );
          }
        )}
      </section>
    </div>
  );
}

function PlayerTile({ player }: { player: Player }) {
  const navigate = useNavigate();
  const displayName = player.name.replace("(C)", "").trim();
  const isCaptain = player.name.includes("(C)");

  return (
    <button
      onClick={() => navigate(`/player/${player.filename}`)}
      className="group relative bg-ink overflow-hidden text-left transition-all hover:ring-2 hover:ring-brand-500 rounded-md"
    >
      {/* 号码 */}
      <div className="absolute top-3 right-3 z-10">
        <span className="font-display text-3xl sm:text-4xl lg:text-5xl text-white leading-none">
          {player.number}
        </span>
      </div>

      {isCaptain && (
        <span className="absolute top-3 left-3 z-10 bg-brand-500 text-ink text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
          C
        </span>
      )}

      {/* 球员照片 */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-slate-600/40 to-slate-800/60">
        <div className="absolute inset-0 flex items-end justify-center pt-6 px-4">
          <PlayerImage
            filename={player.filename}
            alt={player.name}
            className="w-[82%] h-[88%] object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/70 to-transparent pointer-events-none" />
      </div>

      {/* 姓名 */}
      <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4 z-10">
        {player.enName && (
          <div className="text-white/60 text-[10px] sm:text-xs uppercase tracking-wider truncate mb-0.5">
            {player.enName.split(" ").slice(0, -1).join(" ")}
          </div>
        )}
        <div className="font-display text-lg sm:text-xl lg:text-2xl text-white uppercase truncate leading-tight">
          {player.enName
            ? player.enName.split(" ").slice(-1)[0]
            : displayName}
        </div>
      </div>
    </button>
  );
}
