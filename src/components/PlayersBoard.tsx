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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
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
  return (
    <button
      onClick={() => navigate(`/player/${player.filename}`)}
      className="group relative bg-gradient-to-b from-paper-2 to-white border border-black/5 overflow-hidden text-left hover:shadow-xl transition-all"
    >
      {/* 大球衣号水印 */}
      <span
        className="absolute -top-4 right-2 font-display text-[110px] lg:text-[140px] leading-none text-ink/5 pointer-events-none select-none"
        aria-hidden
      >
        {player.number}
      </span>

      {/* 球员照片 */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-brand-100 to-brand-300">
        <PlayerImage
          filename={player.filename}
          alt={player.name}
          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        {/* 底部黑色渐变 */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink to-transparent" />
        {/* 号码 + 位置 */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
          <span className="text-white text-[10px] font-bold uppercase tracking-widest bg-brand-500 text-ink px-2 py-0.5">
            #{player.number}
          </span>
          <span className="text-white/80 text-[10px] font-medium uppercase tracking-wider">
            {player.position}
          </span>
        </div>
      </div>

      {/* 姓名块 */}
      <div className="p-3 lg:p-4 border-t border-black/5 group-hover:bg-brand-50 transition-colors">
        <div className="font-display text-lg lg:text-xl uppercase truncate">
          {player.name.replace("(C)", "")}
          {player.name.includes("(C)") && (
            <span className="ml-1 text-[10px] align-middle bg-ink text-brand-400 px-1 py-0.5">
              C
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wider truncate">
          {player.enName ?? ""}
        </div>
        <div className="mt-2 flex items-center gap-4 text-[11px] text-gray-600">
          <Stat label="出场" value={(player.starts ?? 0) + (player.subs ?? 0)} />
          <Stat label="进球" value={player.goals ?? 0} />
        </div>
      </div>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="font-display text-base text-ink">{value}</span>
      <span className="text-gray-500">{label}</span>
    </div>
  );
}
