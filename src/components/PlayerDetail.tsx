import { Link, useParams } from "react-router-dom";
import { PlayerImage } from "./shared/PlayerImage";
import { useCloudData } from "../hooks/useCloudData";
import { fetchPlayers, type Player } from "../api";

const GROUP_LABEL: Record<Player["positionGroup"], string> = {
  goalkeeper: "Goalkeeper",
  defender: "Defender",
  midfield: "Midfielder",
  forward: "Forward",
};

export function PlayerDetail() {
  const { filename } = useParams();
  const { data, loading, error } = useCloudData<Player[]>(fetchPlayers);

  if (loading) return <PageMsg>加载中...</PageMsg>;
  if (error) return <PageMsg className="text-red-400">数据加载失败</PageMsg>;

  const player = (data ?? []).find((p) => p.filename === filename);
  if (!player) return <PageMsg>未找到该球员</PageMsg>;

  const totalApps = (player.starts ?? 0) + (player.subs ?? 0);

  return (
    <div>
      {/* HERO */}
      <section className="relative bg-ink text-white overflow-hidden">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 items-stretch">
          {/* 左：信息 */}
          <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative z-10">
            <Link
              to="/players"
              className="text-xs text-white/60 hover:text-white uppercase tracking-widest mb-6 inline-flex items-center gap-2 self-start"
            >
              ← Back to Squad
            </Link>
            <span className="text-brand-400 text-xs font-bold uppercase tracking-[0.3em] mb-3">
              ▍ {GROUP_LABEL[player.positionGroup]} · {player.position}
            </span>
            <div className="flex items-baseline gap-4 mb-2">
              <span className="font-display text-[140px] sm:text-[180px] leading-none text-brand-500">
                {player.number}
              </span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl uppercase leading-[1.05] mb-2">
              {player.name.replace("(C)", "")}
              {player.name.includes("(C)") && (
                <span className="ml-3 text-2xl align-middle bg-brand-500 text-ink px-2 py-1">
                  C
                </span>
              )}
            </h1>
            <p className="text-white/60 text-lg uppercase tracking-wider mb-8">
              {player.enName ?? ""} {player.nationalityFlag ?? ""}
            </p>

            <div className="grid grid-cols-3 gap-px bg-white/10 border border-white/10 max-w-md">
              <Headline label="出场" value={totalApps} />
              <Headline label="首发" value={player.starts ?? 0} />
              <Headline label="进球" value={player.goals ?? 0} />
            </div>
          </div>

          {/* 右：照片 */}
          <div className="relative min-h-[400px] lg:min-h-[640px] bg-gradient-to-br from-brand-300 to-brand-500">
            <PlayerImage
              filename={player.filename}
              alt={player.name}
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/40 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* DETAILS */}
      <section className="bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
          <span className="block text-brand-600 text-xs font-bold uppercase tracking-[0.3em] mb-2">
            ▍ Profile
          </span>
          <h2 className="font-display text-3xl sm:text-4xl uppercase mb-8">
            Player Info
          </h2>

          <dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-black/10 border border-black/10">
            <Field label="俱乐部"   value={player.club} />
            <Field label="位置"     value={player.position} />
            <Field label="号码"     value={player.number ? `#${player.number}` : null} />
            <Field label="省份"     value={player.province} />
            <Field label="年龄"     value={player.age != null ? `${player.age} 岁` : null} />
            <Field label="生日"     value={player.birthday} />
            <Field label="身高"     value={player.height != null ? `${player.height} cm` : null} />
            <Field label="体重"     value={player.weight != null ? `${player.weight} kg` : null} />
            <Field label="惯用脚"   value={player.foot} />
            <Field label="替补出场" value={player.subs ?? 0} />
          </dl>
        </div>
      </section>
    </div>
  );
}

function Headline({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-ink p-4 text-center">
      <div className="font-display text-3xl text-brand-400">{value}</div>
      <div className="text-[10px] text-white/60 uppercase tracking-widest mt-1">
        {label}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white p-4">
      <dt className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
        {label}
      </dt>
      <dd className="text-ink font-semibold">{value ?? "--"}</dd>
    </div>
  );
}

function PageMsg({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-24 text-center">
      <p className={`text-gray-500 ${className}`}>{children}</p>
    </div>
  );
}
