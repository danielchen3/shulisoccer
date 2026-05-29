// 前端 → 后端 API 调用层
// 后端实现见 functions/api/*.ts（Cloudflare Pages Functions + D1）

// ---------- 与后端共享的数据类型 ----------

export interface Player {
  id?: number;
  positionGroup: "goalkeeper" | "defender" | "midfield" | "forward";
  position: string;
  number: number;
  filename: string;
  name: string;
  enName?: string;
  club?: string;
  nationality?: string;
  nationalityFlag?: string;
  province?: string;
  age?: number;
  birthday?: string;
  height?: number;
  weight?: number;
  foot?: string;
  starts?: number;
  subs?: number;
  goals?: number;
}

export interface RetiredPlayer {
  id?: number;
  filename: string;
  name: string;
  position: string;
  age?: number;
  height?: number;
  weight?: number;
  foot?: string;
  goals?: number;
}

export interface MatchGoal {
  minute: number;
  player: string;
  type: "goal" | "penalty";
}

export interface MatchEvent {
  round: string;
  left: string;
  score: string;
  right: string;
  video?: { label: string; url: string };
  goals?: MatchGoal[];
}

export interface MatchGroup {
  year: string;
  medal?: string;
  video?: { label: string; url: string };
  events: MatchEvent[];
}

export interface NewsItem {
  id: number;
  date: string;
  content: string;
  image?: string;
  body?: string;
}

export interface TopScorer {
  id?: number;
  name: string;
  goals: number;
}

// ---------- HTTP 客户端 ----------

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

export const fetchPlayers = () => apiGet<Player[]>("/api/players");
export const fetchRetiredPlayers = () => apiGet<RetiredPlayer[]>("/api/retiredPlayers");
export const fetchMatchStats = () => apiGet<MatchGroup[]>("/api/matchStats");
export const fetchNews = () => apiGet<NewsItem[]>("/api/news");
export const fetchTopScorers = () => apiGet<TopScorer[]>("/api/topScorers");
