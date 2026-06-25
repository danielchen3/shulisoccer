import {
  recordAuditLog,
  type AuditLogInput,
  type AuthEnv,
  type AuthPlayer,
} from "./auth";

export type CommentEventKind =
  | "content_comment_created"
  | "content_comment_deleted"
  | "content_comment_reaction_changed"
  | "discussion_comment_created"
  | "discussion_comment_deleted";

export interface CommentAuditEvent {
  version: 1;
  id: string;
  kind: CommentEventKind;
  actor: AuthPlayer;
  audit: AuditLogInput;
  request: {
    ipAddress: string | null;
    userAgent: string | null;
  };
  createdAt: string;
}

export interface CommentEventEnv extends AuthEnv {
  COMMENT_EVENTS?: Queue<CommentAuditEvent>;
}

export async function emitCommentAuditEvent(
  env: CommentEventEnv,
  request: Request,
  actor: AuthPlayer,
  kind: CommentEventKind,
  audit: AuditLogInput
): Promise<void> {
  const event: CommentAuditEvent = {
    version: 1,
    id: crypto.randomUUID(),
    kind,
    actor,
    audit,
    request: {
      ipAddress: request.headers.get("cf-connecting-ip"),
      userAgent: request.headers.get("user-agent"),
    },
    createdAt: new Date().toISOString(),
  };

  if (env.COMMENT_EVENTS) {
    try {
      await env.COMMENT_EVENTS.send(event);
      return;
    } catch (error) {
      console.error("failed to enqueue comment audit event; using sync fallback", error);
    }
  }

  await recordAuditLog(env, request, actor, {
    ...audit,
    eventId: event.id,
  });
}

export function isCommentAuditEvent(value: unknown): value is CommentAuditEvent {
  if (!value || typeof value !== "object") return false;

  const event = value as Partial<CommentAuditEvent>;
  return event.version === 1 &&
    typeof event.id === "string" &&
    typeof event.kind === "string" &&
    !!event.actor &&
    typeof event.actor === "object" &&
    !!event.audit &&
    typeof event.audit === "object" &&
    !!event.request &&
    typeof event.request === "object";
}
