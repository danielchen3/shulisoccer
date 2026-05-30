import { Link, useParams } from "react-router-dom";
import { useCloudData } from "../hooks/useCloudData";
import {
  fetchMatchStats,
  type MatchGroup,
  type MatchGoal,
  type MatchTimelineEvent,
} from "../api";
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

function parseScore(score: string) {
  const m = score.match(/^(\d+)\s*:\s*(\d+)\s*(?:\((\d+)\s*:\s*(\d+)\))?$/);
  if (!m) return { left: "0", right: "0" };
  return {
    left: m[1],
    right: m[2],
    penaltyLeft: m[3],
    penaltyRight: m[4],
  };
}

export function MatchDetail() {
  const { groupIdx, eventIdx } = useParams();
  const base = getBaseUrl();
  const { data, loading, error } = useCloudData<MatchGroup[]>(fetchMatchStats);

  if (loading) return <PageMsg>加载中...</PageMsg>;
  if (error) return <PageMsg className="text-red-400">数据加载失败</PageMsg>;

  const groups = data ?? [];
  const gi = Number(groupIdx);
  const ei = Number(eventIdx);
  const group = groups[gi];
  const event = group?.events[ei];

  if (!group || !event) return <PageMsg>未找到该比赛</PageMsg>;

  const score = parseScore(event.score);
  const hasGoals = event.goals && event.goals.length > 0;
  const starters = event.starters ?? [];
  const timeline = event.timeline ?? [];
  const hasTimeline = timeline.length > 0 || hasGoals;

  return (
    <div>
      {/* Hero */}
      <section className="bg-ink text-white">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
          <Link
            to="/matches"
            className="text-xs text-white/60 hover:text-white uppercase tracking-widest inline-flex items-center gap-2 mb-6"
          >
            ← Back to Matches
          </Link>

          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-brand-400 text-xs font-bold uppercase tracking-[0.3em]">
              {group.year}
            </span>
            {group.medal && <span className="text-xl">{group.medal}</span>}
          </div>
          <div className="text-center text-white/50 text-xs uppercase tracking-widest mb-6">
            {event.round}
          </div>

          {/* Scoreboard */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mb-2">
            <TeamBadge name={event.left} base={base} side="left" />
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3 font-display text-4xl sm:text-5xl lg:text-6xl">
                <span>{score.left}</span>
                <span className="text-white/30">:</span>
                <span>{score.right}</span>
              </div>
              {score.penaltyLeft && (
                <div className="text-xs text-white/40 mt-1">
                  penalties {score.penaltyLeft} : {score.penaltyRight}
                </div>
              )}
            </div>
            <TeamBadge name={event.right} base={base} side="right" />
          </div>

          {event.video && (
            <div className="text-center mt-4">
              <a
                href={event.video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-400 hover:text-brand-300 transition-colors"
              >
                ▶ {event.video.label}
              </a>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 lg:gap-10 items-start">
          <div className="bg-white border border-black/5 rounded-2xl p-6">
            <span className="block text-brand-600 text-xs font-bold uppercase tracking-[0.3em] mb-2">
              ▍ Lineup
            </span>
            <h2 className="font-display text-xl sm:text-2xl uppercase mb-5">
              首发阵容
            </h2>

            {starters.length === 0 ? (
              <EmptyState text="阵容待补充" />
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {starters.map((player, idx) => (
                  <div
                    key={`${player}-${idx}`}
                    className="flex items-center gap-3 rounded-xl bg-paper-2 px-3.5 py-2.5"
                  >
                    <span className="font-display text-brand-500 text-base w-5 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-sm text-ink">{player}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-black/5 rounded-2xl p-6">
            <span className="block text-brand-600 text-xs font-bold uppercase tracking-[0.3em] mb-2">
              ▍ Timeline
            </span>
            <h2 className="font-display text-xl sm:text-2xl uppercase mb-8">
              Match Events
            </h2>

            {!hasTimeline ? (
              <EmptyState text="比赛时间线待补充" />
            ) : (
              <div className="relative">
                <div className="absolute left-1/2 -translate-x-1/2 top-2 bottom-2 w-px bg-emerald-500/70" />

                <div className="space-y-0">
                  {timeline.map((item, idx) => (
                    <TimelineEvent key={`t-${idx}`} item={item} />
                  ))}
                  {renderLegacyGoalEvents(event.goals)}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function TeamBadge({ name, base, side }: { name: string; base: string; side: "left" | "right" }) {
  const logo = TEAM_LOGO[name];
  const isOurs = name === OUR_TEAM;

  return (
    <div className="flex flex-col items-center gap-2 min-w-[80px]">
      {logo && (
        <img
          src={`${base}${logo}`}
          alt=""
          className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
        />
      )}
      <span
        className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${
          isOurs ? "text-brand-400" : "text-white/70"
        }`}
      >
        {name}
      </span>
    </div>
  );
}

function GoalEvent({ goal, isPenalty }: { goal: MatchGoal; isPenalty?: boolean }) {
  return (
    <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-3">
      <div />
      <div className="relative z-10 w-[52px] h-[52px] rounded-full bg-emerald-500 text-white border-4 border-white shadow-[0_8px_22px_rgba(16,185,129,0.25)] flex items-center justify-center font-display text-base">
        {!isPenalty ? `${goal.minute}'` : "PEN"}
      </div>
      <div className="rounded-2xl border border-brand-100 bg-white px-4 py-3 shadow-sm">
        <div className="text-xs font-bold text-ink">⚽ 进球</div>
        <div className="mt-1 text-base font-semibold text-ink">{goal.player}</div>
      </div>
    </div>
  );
}

function TimelineEvent({ item }: { item: MatchTimelineEvent }) {
  if (item.type === "half_time") {
    return <TimelineMarker item={item} />;
  }

  const config = getTimelineEventConfig(item.type);
  const primaryText = getTimelinePrimaryText(item);
  const secondaryLines = getTimelineSecondaryLines(item);
  const isLeft = item.side !== "right";

  return (
    <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-3">
      <div className={isLeft ? "flex justify-end" : ""}>
        {isLeft && (
          <TimelineCard
            align="left"
            config={config}
            primaryText={primaryText}
            secondaryLines={secondaryLines}
          />
        )}
      </div>

      <div className="relative z-10 w-[52px] h-[52px] rounded-full bg-emerald-500 text-white border-4 border-white shadow-[0_8px_22px_rgba(16,185,129,0.25)] flex items-center justify-center font-display text-base">
        {item.minute != null ? `${item.minute}'` : "--"}
      </div>

      <div className={!isLeft ? "flex justify-start" : ""}>
        {!isLeft && (
          <TimelineCard
            align="right"
            config={config}
            primaryText={primaryText}
            secondaryLines={secondaryLines}
          />
        )}
      </div>
    </div>
  );
}

function getTimelineEventConfig(type: MatchTimelineEvent["type"]) {
  switch (type) {
    case "goal":
      return {
        kind: "default" as const,
        icon: "⚽",
        iconClass: "text-ink",
        labelClass: "text-ink",
        dotClass: "border-emerald-500 group-hover:border-emerald-600",
      };
    case "substitution":
      return {
        kind: "default" as const,
        icon: "⇄",
        iconClass: "text-emerald-600",
        labelClass: "text-ink",
        dotClass: "border-emerald-500 group-hover:border-emerald-600",
      };
    case "yellow_card":
      return {
        kind: "card" as const,
        icon: "🟨",
        iconClass: "",
        labelClass: "text-amber-700",
        dotClass: "border-amber-400 group-hover:border-amber-500",
      };
    case "red_card":
      return {
        kind: "card" as const,
        icon: "🟥",
        iconClass: "",
        labelClass: "text-red-700",
        dotClass: "border-red-500 group-hover:border-red-600",
      };
    case "half_time":
      return {
        kind: "default" as const,
        icon: "",
        iconClass: "",
        labelClass: "text-ink",
        dotClass: "",
      };
  }
}

function getTimelinePrimaryText(item: MatchTimelineEvent) {
  switch (item.type) {
    case "goal":
      return "进球";
    case "substitution":
      return "换人";
    case "yellow_card":
      return item.player ? `${item.player} · 黄牌` : "黄牌";
    case "red_card":
      return item.player ? `${item.player} · 红牌` : "红牌";
    case "half_time":
      return item.score ? `半场 ${item.score}` : "半场";
  }
}

function getTimelineSecondaryLines(item: MatchTimelineEvent) {
  switch (item.type) {
    case "goal":
      return [item.player, item.detail].filter(Boolean) as string[];
    case "substitution": {
      const lines: string[] = [];
      const ins = item.playersIn ?? (item.playerIn ? [item.playerIn] : []);
      const outs = item.playersOut ?? (item.playerOut ? [item.playerOut] : []);
      lines.push(...ins.map((player) => `↑ ${player}`));
      lines.push(...outs.map((player) => `↓ ${player}`));
      if (item.detail) lines.push(item.detail);
      return lines;
    }
    case "yellow_card":
    case "red_card":
      return [item.detail].filter(Boolean) as string[];
    case "half_time":
      return [];
  }
}

function TimelineCard({
  align,
  config,
  primaryText,
  secondaryLines,
}: {
  align: "left" | "right";
  config: ReturnType<typeof getTimelineEventConfig>;
  primaryText: string;
  secondaryLines: string[];
}) {
  return (
    <div className="w-full max-w-[270px] rounded-2xl border border-brand-100 bg-white px-4 py-3 shadow-sm">
      <div className={`${getTimelinePrimaryClass(config.kind)} ${config.labelClass}`}>
        <span className={config.iconClass}>{config.icon}</span>
        {config.icon ? " " : ""}
        {primaryText}
      </div>
      {secondaryLines.length > 0 && (
        <div className="mt-1 space-y-1">
          {secondaryLines.map((line, idx) => (
            <div
              key={`${align}-${idx}-${line}`}
              className={getTimelineLineClass(line)}
            >
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getTimelineLineClass(line: string) {
  if (line.startsWith("↑")) return "text-base font-semibold text-emerald-600";
  if (line.startsWith("↓")) return "text-base font-semibold text-red-500";
  return "text-base font-semibold text-ink";
}

function getTimelinePrimaryClass(kind: ReturnType<typeof getTimelineEventConfig>["kind"]) {
  if (kind === "card") return "text-base font-semibold";
  return "text-xs font-bold";
}

function TimelineMarker({ item }: { item: MatchTimelineEvent }) {
  return (
    <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-5">
      <div />
      <div className="relative z-10 rounded-full border-2 border-emerald-300 bg-emerald-50 px-5 py-2 text-emerald-700 font-display text-xl">
        {item.score ? `半场 ${item.score}` : "半场"}
      </div>
      <div />
    </div>
  );
}

function renderLegacyGoalEvents(goals?: MatchGoal[]) {
  if (!goals || goals.length === 0) return null;

  const regularGoals = goals.filter((g) => g.type === "goal");
  const penaltyGoals = goals.filter((g) => g.type === "penalty");

  return (
    <>
      {regularGoals.map((goal, idx) => (
        <GoalEvent key={`g-${idx}`} goal={goal} />
      ))}

      {penaltyGoals.length > 0 && (
        <>
          <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-4">
            <div />
            <div className="relative z-10 rounded-full border-2 border-brand-200 bg-white px-5 py-2 text-brand-700 font-display text-sm uppercase tracking-wider">
              Penalty Shootout
            </div>
            <div />
          </div>
          {penaltyGoals.map((goal, idx) => (
            <GoalEvent key={`p-${idx}`} goal={goal} isPenalty />
          ))}
        </>
      )}
    </>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-gray-400 text-sm py-8 text-center border border-dashed border-gray-200 rounded-lg">
      {text}
    </div>
  );
}

function PageMsg({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-10 py-24 text-center">
      <p className={`text-gray-500 ${className}`}>{children}</p>
    </div>
  );
}
