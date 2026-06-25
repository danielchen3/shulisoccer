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

export interface MatchTimelineEvent {
  type: "goal" | "substitution" | "yellow_card" | "red_card" | "half_time";
  minute?: number;
  side?: "left" | "right";
  team?: string;
  player?: string;
  playerIn?: string;
  playerOut?: string;
  playersIn?: string[];
  playersOut?: string[];
  score?: string;
  detail?: string;
}

export interface MatchEvent {
  round: string;
  left: string;
  score: string;
  right: string;
  video?: { label: string; url: string };
  goals?: MatchGoal[];
  starters?: string[];
  timeline?: MatchTimelineEvent[];
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

export type PlayerRole = "player" | "captain" | "admin";

export interface AuthPlayer {
  id: number;
  filename: string | null;
  name: string;
  username: string | null;
  role: PlayerRole;
}

export interface NewsInput {
  date: string;
  content: string;
  image?: string;
  body?: string;
}

export type DiscussionCategory = "general" | "training" | "match" | "tactics" | "announcement";

export interface DiscussionAuthor {
  authorId: number;
  authorName: string;
  authorFilename: string;
  authorRole: PlayerRole;
}

export interface DiscussionThread extends DiscussionAuthor {
  id: number;
  authorPlayerId?: number;
  category: DiscussionCategory;
  title: string;
  body: string;
  pinned: number;
  locked: number;
  createdAt: string;
  updatedAt: string;
  commentCount?: number;
}

export interface DiscussionComment extends DiscussionAuthor {
  id: number;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export type ContentTargetType = "news" | "match";
export type ContentReaction = "like" | "heart" | "fire" | "clap" | "laugh";

export interface ContentComment extends DiscussionAuthor {
  id: number;
  targetType: ContentTargetType;
  targetId: string;
  parentCommentId: number | null;
  body: string;
  createdAt: string;
  updatedAt: string;
  reactionCounts: Record<string, number>;
  myReactions: ContentReaction[];
}

export interface DiscussionThreadInput {
  category: DiscussionCategory;
  title: string;
  body: string;
  pinned?: boolean;
  locked?: boolean;
}

export interface AuditLogEntry {
  id: number;
  actorPlayerId: number | null;
  actorName: string | null;
  actorRole: PlayerRole | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(path: string, status: number, code?: string) {
    super(code ? `API ${path} failed: ${status} (${code})` : `API ${path} failed: ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export interface AdminPlayer extends Player {
  id: number;
  username: string | null;
  role: PlayerRole;
  loginEnabled: number;
  lastLoginAt?: string | null;
}

export type PlayerInput = Omit<AdminPlayer, "id" | "username" | "lastLoginAt"> & {
  resetPassword?: boolean;
};

// ---------- HTTP 客户端 ----------

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: "same-origin" });
  if (!res.ok) throw await createApiError(path, res);
  return res.json();
}

async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) throw await createApiError(path, res);
  return res.json();
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "PATCH",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw await createApiError(path, res);
  return res.json();
}

async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    method: "DELETE",
    credentials: "same-origin",
  });

  if (!res.ok) throw await createApiError(path, res);
  return res.json();
}

async function createApiError(path: string, res: Response): Promise<ApiError> {
  try {
    const body = await res.clone().json();
    const code = typeof body?.error === "string" ? body.error : undefined;
    return new ApiError(path, res.status, code);
  } catch {
    return new ApiError(path, res.status);
  }
}

export const fetchPlayers = () => apiGet<Player[]>("/api/players");
export const fetchRetiredPlayers = () => apiGet<RetiredPlayer[]>("/api/retiredPlayers");
export const fetchMatchStats = () => apiGet<MatchGroup[]>("/api/matchStats");
export const fetchNews = () => apiGet<NewsItem[]>("/api/news");
export const fetchTopScorers = () => apiGet<TopScorer[]>("/api/topScorers");
export const fetchCurrentPlayer = () => apiGet<{ player: AuthPlayer | null }>("/api/auth/me");
export const loginPlayer = (username: string, password: string) =>
  apiPost<{ player: AuthPlayer; expiresAt: string }>("/api/auth/login", { username, password });
export const logoutPlayer = () => apiPost<{ ok: true }>("/api/auth/logout");
export const fetchAdminNews = () => apiGet<{ news: NewsItem[] }>("/api/admin/news");
export const createAdminNews = (input: NewsInput) =>
  apiPost<{ news: NewsItem }>("/api/admin/news", input);
export const updateAdminNews = (id: number, input: Partial<NewsInput>) =>
  apiPatch<{ news: NewsItem }>(`/api/admin/news/${id}`, input);
export const deleteAdminNews = (id: number) =>
  apiDelete<{ ok: true }>(`/api/admin/news/${id}`);
export const fetchAdminPlayers = () => apiGet<{ players: AdminPlayer[] }>("/api/admin/players");
export const createAdminPlayer = (input: PlayerInput) =>
  apiPost<{ player: AdminPlayer }>("/api/admin/players", input);
export const updateAdminPlayer = (id: number, input: Partial<PlayerInput>) =>
  apiPatch<{ player: AdminPlayer }>(`/api/admin/players/${id}`, input);
export const deleteAdminPlayer = (id: number) =>
  apiDelete<{ ok: true }>(`/api/admin/players/${id}`);
export const fetchDiscussionThreads = (category = "all", offset = 0, limit = 20) =>
  apiGet<{ threads: DiscussionThread[] }>(
    `/api/discussions?category=${encodeURIComponent(category)}&offset=${offset}&limit=${limit}`
  );
export const createDiscussionThread = (input: DiscussionThreadInput) =>
  apiPost<{ thread: DiscussionThread }>("/api/discussions", input);
export const fetchDiscussionThread = (id: number) =>
  apiGet<{ thread: DiscussionThread; comments: DiscussionComment[] }>(`/api/discussions/${id}`);
export const updateDiscussionThread = (id: number, input: Partial<DiscussionThreadInput>) =>
  apiPatch<{ thread: DiscussionThread }>(`/api/discussions/${id}`, input);
export const deleteDiscussionThread = (id: number) =>
  apiDelete<{ ok: true }>(`/api/discussions/${id}`);
export const createDiscussionComment = (threadId: number, body: string) =>
  apiPost<{ comment: DiscussionComment }>(`/api/discussions/${threadId}/comments`, { body });
export const deleteDiscussionComment = (threadId: number, commentId: number) =>
  apiDelete<{ ok: true }>(`/api/discussions/${threadId}/comments/${commentId}`);
export const fetchAuditLogs = (offset = 0, limit = 50) =>
  apiGet<{ auditLogs: AuditLogEntry[] }>(`/api/admin/auditLogs?offset=${offset}&limit=${limit}`);
export const fetchContentComments = (targetType: ContentTargetType, targetId: string) =>
  apiGet<{ comments: ContentComment[] }>(
    `/api/comments?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`
  );
export const createContentComment = (
  targetType: ContentTargetType,
  targetId: string,
  body: string,
  parentCommentId?: number | null
) =>
  apiPost<{ comment: ContentComment | null }>("/api/comments", {
    targetType,
    targetId,
    body,
    parentCommentId: parentCommentId ?? null,
  });
export const deleteContentComment = (id: number) =>
  apiDelete<{ ok: true }>(`/api/comments/${id}`);
export const toggleContentCommentReaction = (id: number, reaction: ContentReaction) =>
  apiPost<{
    reactionCounts: Record<string, number>;
    myReactions: ContentReaction[];
    selected: boolean;
  }>(`/api/comments/${id}/reactions`, { reaction });
