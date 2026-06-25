import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
  ApiError,
  createContentComment,
  deleteContentComment,
  fetchContentComments,
  toggleContentCommentReaction,
  type ContentComment,
  type ContentReaction,
  type ContentTargetType,
} from "../../api";
import { RoleBadge, formatDateTime } from "../discussion/DiscussionShared";

const REFRESH_INTERVAL_MS = 5000;

const REACTIONS: Array<{ value: ContentReaction; label: string; icon: string }> = [
  { value: "like", label: "Like", icon: "👍" },
  { value: "heart", label: "Heart", icon: "❤️" },
  { value: "fire", label: "Fire", icon: "🔥" },
  { value: "clap", label: "Clap", icon: "👏" },
  { value: "laugh", label: "Laugh", icon: "😂" },
];

interface ContentCommentsProps {
  targetType: ContentTargetType;
  targetId: string;
  title?: string;
}

export function ContentComments({ targetType, targetId, title = "Comments" }: ContentCommentsProps) {
  const { player } = useAuth();
  const [comments, setComments] = useState<ContentComment[]>([]);
  const [body, setBody] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replyTo, setReplyTo] = useState<ContentComment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async (
    options: { showLoading?: boolean; showError?: boolean } = {}
  ) => {
    const showLoading = options.showLoading ?? true;
    const showError = options.showError ?? true;
    if (showLoading) setLoading(true);
    if (showError) setError(null);

    try {
      const result = await fetchContentComments(targetType, targetId);
      setComments(result.comments);
    } catch (caught) {
      if (showError) setError(toErrorMessage(caught, "Failed to load comments"));
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [targetType, targetId]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadComments({ showLoading: false, showError: false });
      }
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [loadComments]);

  const tree = useMemo(() => buildCommentTree(comments), [comments]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!player) return;
    setSubmitting(true);
    setError(null);

    try {
      await createContentComment(targetType, targetId, body);
      setBody("");
      await loadComments({ showLoading: false });
    } catch (caught) {
      setError(toErrorMessage(caught, "Failed to publish comment"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!player || !replyTo) return;
    setSubmitting(true);
    setError(null);

    try {
      await createContentComment(targetType, targetId, replyBody, replyTo.id);
      setReplyBody("");
      setReplyTo(null);
      await loadComments({ showLoading: false });
    } catch (caught) {
      setError(toErrorMessage(caught, "Failed to publish reply"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(comment: ContentComment) {
    if (!window.confirm("Delete this comment?")) return;
    setError(null);
    try {
      await deleteContentComment(comment.id);
      await loadComments({ showLoading: false });
    } catch (caught) {
      setError(toErrorMessage(caught, "Failed to delete comment"));
    }
  }

  async function handleReaction(comment: ContentComment, reaction: ContentReaction) {
    if (!player) return;
    setError(null);
    try {
      const result = await toggleContentCommentReaction(comment.id, reaction);
      setComments((current) =>
        current.map((item) =>
          item.id === comment.id
            ? {
                ...item,
                reactionCounts: result.reactionCounts,
                myReactions: result.myReactions,
              }
            : item
        )
      );
    } catch (caught) {
      setError(toErrorMessage(caught, "Failed to update reaction"));
    }
  }

  return (
    <section className="mt-10 border-t border-black/10 pt-8">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-700">
            Team Talk
          </p>
          <h2 className="mt-1 text-2xl font-bold">{title}</h2>
        </div>
        <span className="text-sm text-black/50">{comments.length}</span>
      </div>

      {error && (
        <div className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {player ? (
        <form onSubmit={handleSubmit} className="bg-white border border-black/10 p-4 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-black/70">
              Comment as {player.username}
            </span>
            <span className="text-[11px] text-black/40">{body.length}/2000</span>
          </div>
          <textarea
            value={body}
            maxLength={2000}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            placeholder="Share a thought..."
            className="w-full resize-y border border-black/20 px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-brand-600"
          />
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="px-5 py-3 bg-ink text-white text-xs font-bold uppercase tracking-[0.16em] disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <div className="bg-white border border-black/10 p-4 text-sm text-black/60">
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-600">
            Login
          </Link>{" "}
          to comment, reply, like, or react.
        </div>
      )}

      <div className="mt-5 bg-white border border-black/10 divide-y divide-black/10">
        {loading && <div className="p-5 text-black/60">Loading comments...</div>}
        {!loading && comments.length === 0 && (
          <div className="p-5 text-black/60">No comments yet.</div>
        )}
        {!loading && tree.map((node) => (
          <CommentItem
            key={node.comment.id}
            node={node}
            playerId={player?.id ?? null}
            canModerate={player?.role === "admin" || player?.role === "captain"}
            onReply={player ? setReplyTo : undefined}
            onDelete={handleDelete}
            onReaction={handleReaction}
          />
        ))}
      </div>

      {replyTo && player && (
        <form onSubmit={handleReply} className="mt-4 bg-white border border-black/10 p-4 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-black/60">
              Replying to <strong className="text-black/80">{replyTo.authorName}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setReplyTo(null);
                setReplyBody("");
              }}
              className="text-xs uppercase tracking-wider text-black/50 hover:text-black"
            >
              Cancel
            </button>
          </div>
          <textarea
            value={replyBody}
            maxLength={2000}
            onChange={(event) => setReplyBody(event.target.value)}
            rows={3}
            placeholder="Write a reply..."
            className="w-full resize-y border border-black/20 px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-brand-600"
          />
          <button
            type="submit"
            disabled={submitting || !replyBody.trim()}
            className="px-5 py-3 bg-ink text-white text-xs font-bold uppercase tracking-[0.16em] disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Post Reply"}
          </button>
        </form>
      )}
    </section>
  );
}

interface CommentNode {
  comment: ContentComment;
  children: CommentNode[];
}

function CommentItem({
  node,
  playerId,
  canModerate,
  onReply,
  onDelete,
  onReaction,
  depth = 0,
}: {
  node: CommentNode;
  playerId: number | null;
  canModerate: boolean;
  onReply?: (comment: ContentComment) => void;
  onDelete: (comment: ContentComment) => void;
  onReaction: (comment: ContentComment, reaction: ContentReaction) => void;
  depth?: number;
}) {
  const { comment, children } = node;
  const canDelete = canModerate || playerId === comment.authorId;

  return (
    <article className={depth === 0 ? "p-5" : "pl-5 mt-4 border-l border-black/10"}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-black/50">
        <span className="font-semibold text-black/75">{comment.authorName}</span>
        <RoleBadge role={comment.authorRole} />
        <span>/</span>
        <span>{formatDateTime(comment.createdAt)}</span>
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-black/80">
        {comment.body}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {REACTIONS.map((reaction) => {
          const selected = comment.myReactions.includes(reaction.value);
          const count = comment.reactionCounts[reaction.value] ?? 0;
          return (
            <button
              key={reaction.value}
              type="button"
              disabled={playerId == null}
              onClick={() => onReaction(comment, reaction.value)}
              title={reaction.label}
              className={[
                "inline-flex h-8 items-center gap-1 border px-2 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                selected
                  ? "border-brand-500 bg-brand-50 text-brand-800"
                  : "border-black/10 text-black/60 hover:text-black",
              ].join(" ")}
            >
              <span>{reaction.icon}</span>
              {count > 0 && <span>{count}</span>}
            </button>
          );
        })}

        {onReply && (
          <button
            type="button"
            onClick={() => onReply(comment)}
            className="h-8 px-2 text-xs font-semibold uppercase tracking-wider text-black/50 hover:text-black"
          >
            Reply
          </button>
        )}

        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(comment)}
            className="h-8 px-2 text-xs font-semibold uppercase tracking-wider text-red-700"
          >
            Delete
          </button>
        )}
      </div>

      {children.length > 0 && (
        <div className="mt-4 space-y-4">
          {children.map((child) => (
            <CommentItem
              key={child.comment.id}
              node={child}
              playerId={playerId}
              canModerate={canModerate}
              onReply={onReply}
              onDelete={onDelete}
              onReaction={onReaction}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </article>
  );
}

function buildCommentTree(comments: ContentComment[]): CommentNode[] {
  const nodes = new Map<number, CommentNode>();
  const roots: CommentNode[] = [];

  for (const comment of comments) {
    nodes.set(comment.id, { comment, children: [] });
  }

  for (const comment of comments) {
    const node = nodes.get(comment.id);
    if (!node) continue;
    const parent = comment.parentCommentId == null ? null : nodes.get(comment.parentCommentId);
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function toErrorMessage(caught: unknown, fallback: string) {
  if (caught instanceof ApiError) {
    return `${fallback}: ${caught.status}${caught.code ? ` ${caught.code}` : ""}`;
  }
  return fallback;
}
