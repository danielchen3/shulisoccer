import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
  ApiError,
  createDiscussionThread,
  fetchDiscussionThreads,
  type DiscussionCategory,
  type DiscussionThread,
} from "../../api";
import { PageHero } from "../shared/PageHero";
import {
  DISCUSSION_CATEGORIES,
  DiscussionGate,
  RoleBadge,
  formatDateTime,
} from "./DiscussionShared";

const DISCUSSION_REFRESH_INTERVAL_MS = 3000;

export function DiscussionBoard() {
  const { player } = useAuth();
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [newCategory, setNewCategory] = useState<DiscussionCategory>("general");
  const [pinned, setPinned] = useState(false);
  const [locked, setLocked] = useState(false);

  const canModerate = player?.role === "admin" || player?.role === "captain";

  const loadThreads = useCallback(async (
    nextCategory: string,
    options: { showLoading?: boolean; showError?: boolean } = {}
  ) => {
    const showLoading = options.showLoading ?? true;
    const showError = options.showError ?? true;
    if (showLoading) setLoading(true);
    if (showError) setError(null);

    try {
      const result = await fetchDiscussionThreads(nextCategory);
      setThreads(result.threads);
    } catch (caught) {
      if (showError) setError(toErrorMessage(caught, "Failed to load discussions"));
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadThreads(category);
  }, [category, loadThreads]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadThreads(category, { showLoading: false, showError: false });
      }
    }, DISCUSSION_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [category, loadThreads]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedCategory = newCategory;
    setSubmitting(true);
    setError(null);

    try {
      await createDiscussionThread({
        category: submittedCategory,
        title,
        body,
        pinned,
        locked,
      });
      setTitle("");
      setBody("");
      setNewCategory("general");
      setPinned(false);
      setLocked(false);

      if (category !== "all" && category !== submittedCategory) {
        setCategory(submittedCategory);
      } else {
        await loadThreads(category, { showLoading: false });
      }
    } catch (caught) {
      setError(toErrorMessage(caught, "Failed to publish"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DiscussionGate>
      <PageHero eyebrow="Team Panel" title="Discussion" subtitle="Player discussion panel" />
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-black/10 p-5 lg:sticky lg:top-20 self-start"
          >
            <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-brand-700 font-bold">
                  New Thread
                </p>
                <h2 className="mt-1 text-lg font-bold">Start a discussion</h2>
              </div>
              <span className="shrink-0 border border-black/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-black/50">
                {player?.username}
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="block text-xs font-bold uppercase tracking-[0.14em] text-black/50 mb-2">
                  Category
                </span>
                <select
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value as DiscussionCategory)}
                  className="w-full border border-black/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-600"
                >
                  {DISCUSSION_CATEGORIES.filter((item) => item.value !== "all").map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                      disabled={item.value === "announcement" && !canModerate}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-bold uppercase tracking-[0.14em] text-black/50 mb-2">
                  Title
                </span>
                <input
                  value={title}
                  maxLength={120}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Training time, match plan, logistics..."
                  className="w-full border border-black/20 px-3 py-2.5 text-sm outline-none focus:border-brand-600"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-bold uppercase tracking-[0.14em] text-black/50 mb-2">
                  Body
                </span>
                <textarea
                  value={body}
                  maxLength={5000}
                  onChange={(event) => setBody(event.target.value)}
                  rows={9}
                  placeholder="Write the details..."
                  className="w-full resize-y border border-black/20 px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-brand-600"
                />
                <span className="mt-1 block text-right text-[11px] text-black/40">
                  {body.length}/5000
                </span>
              </label>

              {canModerate && (
                <div className="grid grid-cols-2 gap-2 border-t border-black/10 pt-4">
                  <label className="flex items-center gap-2 border border-black/10 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={pinned}
                      onChange={(event) => setPinned(event.target.checked)}
                    />
                    Pin
                  </label>
                  <label className="flex items-center gap-2 border border-black/10 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={locked}
                      onChange={(event) => setLocked(event.target.checked)}
                    />
                    Lock
                  </label>
                </div>
              )}

              {error && (
                <div className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !title.trim() || !body.trim()}
                className="w-full px-5 py-3 bg-ink text-white text-xs font-bold uppercase tracking-[0.16em] disabled:opacity-50"
              >
                {submitting ? "Posting..." : "Post Thread"}
              </button>
            </div>
          </form>

          <div className="space-y-4">
            <div className="bg-white border border-black/10 p-2 flex gap-2 overflow-x-auto">
              {DISCUSSION_CATEGORIES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCategory(item.value)}
                  className={[
                    "px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] border whitespace-nowrap",
                    category === item.value
                      ? "bg-ink text-white border-ink"
                      : "border-black/10 text-black/60 hover:text-black",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="bg-white border border-black/10 divide-y divide-black/10">
              {loading && <div className="p-5 text-black/60">Loading...</div>}
              {!loading && threads.length === 0 && (
                <div className="p-5 text-black/60">No discussions yet.</div>
              )}
              {threads.map((thread) => (
                <Link
                  key={thread.id}
                  to={`/discussion/${thread.id}`}
                  className="block p-5 hover:bg-black/[0.02]"
                >
                  <article>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {thread.pinned === 1 && (
                        <span className="px-2 py-0.5 bg-ink text-white text-[10px] font-bold uppercase tracking-wider">
                          Pinned
                        </span>
                      )}
                      {thread.locked === 1 && (
                        <span className="px-2 py-0.5 border border-black/20 text-[10px] font-bold uppercase tracking-wider">
                          Locked
                        </span>
                      )}
                      <span className="text-xs uppercase tracking-wider text-brand-700 font-bold">
                        {thread.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold">{thread.title}</h3>
                    <p className="text-sm text-black/60 mt-2 line-clamp-2 whitespace-pre-line">
                      {thread.body}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-black/50">
                      <span>{thread.authorName}</span>
                      <RoleBadge role={thread.authorRole} />
                      <span>/</span>
                      <span>{formatDateTime(thread.updatedAt)}</span>
                      <span>/</span>
                      <span>{thread.commentCount ?? 0} comments</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </DiscussionGate>
  );
}

function toErrorMessage(caught: unknown, fallback: string) {
  if (caught instanceof ApiError) {
    return `${fallback}: ${caught.status}${caught.code ? ` ${caught.code}` : ""}`;
  }
  return fallback;
}
