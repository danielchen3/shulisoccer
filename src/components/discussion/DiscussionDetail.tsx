import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
  ApiError,
  createDiscussionComment,
  deleteDiscussionComment,
  deleteDiscussionThread,
  fetchDiscussionThread,
  updateDiscussionThread,
  type DiscussionComment,
  type DiscussionThread,
} from "../../api";
import { PageHero } from "../shared/PageHero";
import { DiscussionGate, RoleBadge, formatDateTime } from "./DiscussionShared";

const DISCUSSION_REFRESH_INTERVAL_MS = 3000;

export function DiscussionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { player } = useAuth();
  const threadId = Number(id);
  const [thread, setThread] = useState<DiscussionThread | null>(null);
  const [comments, setComments] = useState<DiscussionComment[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canModerate = player?.role === "admin" || player?.role === "captain";
  const canDeleteThread = Boolean(thread && player && (canModerate || thread.authorId === player.id));
  const canComment = thread?.locked !== 1 || canModerate;

  const loadThread = useCallback(async (
    options: { showLoading?: boolean; showError?: boolean } = {}
  ) => {
    if (!Number.isInteger(threadId) || threadId <= 0) {
      setError("Discussion not found");
      setLoading(false);
      return;
    }

    const showLoading = options.showLoading ?? true;
    const showError = options.showError ?? true;
    if (showLoading) setLoading(true);
    if (showError) setError(null);

    try {
      const result = await fetchDiscussionThread(threadId);
      setThread(result.thread);
      setComments(result.comments);
    } catch (caught) {
      if (showError) setError(toErrorMessage(caught, "Failed to load discussion"));
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    void loadThread();
  }, [loadThread]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadThread({ showLoading: false, showError: false });
      }
    }, DISCUSSION_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [loadThread]);

  async function handleComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await createDiscussionComment(threadId, body);
      setBody("");
      await loadThread({ showLoading: false });
    } catch (caught) {
      setError(toErrorMessage(caught, "Failed to publish comment"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteThread() {
    if (!thread || !window.confirm(`Delete discussion: ${thread.title}?`)) return;
    try {
      await deleteDiscussionThread(thread.id);
      navigate("/discussion", { replace: true });
    } catch (caught) {
      setError(toErrorMessage(caught, "Failed to delete discussion"));
    }
  }

  async function handleToggleLocked() {
    if (!thread) return;
    try {
      await updateDiscussionThread(thread.id, { locked: thread.locked !== 1 });
      await loadThread({ showLoading: false });
    } catch (caught) {
      setError(toErrorMessage(caught, "Failed to update lock status"));
    }
  }

  async function handleTogglePinned() {
    if (!thread) return;
    try {
      await updateDiscussionThread(thread.id, { pinned: thread.pinned !== 1 });
      await loadThread({ showLoading: false });
    } catch (caught) {
      setError(toErrorMessage(caught, "Failed to update pin status"));
    }
  }

  async function handleDeleteComment(comment: DiscussionComment) {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteDiscussionComment(threadId, comment.id);
      await loadThread({ showLoading: false });
    } catch (caught) {
      setError(toErrorMessage(caught, "Failed to delete comment"));
    }
  }

  return (
    <DiscussionGate>
      <PageHero eyebrow="Team Panel" title="Discussion" subtitle="Player discussion panel" />
      <section className="max-w-[920px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <Link
          to="/discussion"
          className="text-xs uppercase tracking-widest text-black/50 hover:text-black"
        >
          Back to Discussion
        </Link>

        {loading && <div className="py-12 text-black/60">Loading...</div>}
        {!loading && error && (
          <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && thread && (
          <div className="mt-6 space-y-6">
            <article className="bg-white border border-black/10 p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
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
              <h1 className="text-3xl font-bold leading-tight">{thread.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-black/50">
                <span>{thread.authorName}</span>
                <RoleBadge role={thread.authorRole} />
                <span>/</span>
                <span>{formatDateTime(thread.createdAt)}</span>
              </div>
              <p className="mt-6 whitespace-pre-line leading-relaxed">{thread.body}</p>

              {(canModerate || canDeleteThread) && (
                <div className="flex flex-wrap gap-2 mt-6 border-t border-black/10 pt-4">
                  {canModerate && (
                    <>
                      <button
                        type="button"
                        onClick={handleTogglePinned}
                        className="px-3 py-2 border border-black/20 text-xs font-semibold uppercase tracking-wider"
                      >
                        {thread.pinned === 1 ? "Unpin" : "Pin"}
                      </button>
                      <button
                        type="button"
                        onClick={handleToggleLocked}
                        className="px-3 py-2 border border-black/20 text-xs font-semibold uppercase tracking-wider"
                      >
                        {thread.locked === 1 ? "Unlock" : "Lock"}
                      </button>
                    </>
                  )}
                  {canDeleteThread && (
                    <button
                      type="button"
                      onClick={handleDeleteThread}
                      className="px-3 py-2 border border-red-200 text-xs font-semibold uppercase tracking-wider text-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </article>

            <section className="bg-white border border-black/10 divide-y divide-black/10">
              <div className="p-5 flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold">Comments</h2>
                <span className="text-xs text-black/40">{comments.length}</span>
              </div>
              {comments.length === 0 && (
                <div className="p-5 text-black/60">No comments yet.</div>
              )}
              {comments.map((comment) => {
                const canDeleteComment = Boolean(
                  player && (canModerate || comment.authorId === player.id)
                );
                return (
                  <article key={comment.id} className="p-5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-black/50">
                      <span className="font-semibold text-black/70">{comment.authorName}</span>
                      <RoleBadge role={comment.authorRole} />
                      <span>/</span>
                      <span>{formatDateTime(comment.createdAt)}</span>
                    </div>
                    <p className="mt-3 whitespace-pre-line leading-relaxed">{comment.body}</p>
                    {canDeleteComment && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment)}
                        className="mt-3 text-xs uppercase tracking-wider text-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </article>
                );
              })}
            </section>

            <form onSubmit={handleComment} className="bg-white border border-black/10 p-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold">Add a comment</h2>
                <span className="text-[11px] text-black/40">{body.length}/2000</span>
              </div>
              {!canComment && (
                <div className="border border-black/10 bg-paper-2 px-3 py-2 text-sm text-black/60">
                  This discussion is locked.
                </div>
              )}
              <textarea
                value={body}
                maxLength={2000}
                onChange={(event) => setBody(event.target.value)}
                rows={5}
                disabled={!canComment}
                placeholder="Write a comment..."
                className="w-full resize-y border border-black/20 px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-brand-600 disabled:bg-black/5"
              />
              <button
                type="submit"
                disabled={submitting || !body.trim() || !canComment}
                className="px-5 py-3 bg-ink text-white text-xs font-bold uppercase tracking-[0.16em] disabled:opacity-50"
              >
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </form>
          </div>
        )}
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
