import { recordAuditLogEntry } from "../functions/_lib/auth";
import {
  isCommentAuditEvent,
  type CommentAuditEvent,
} from "../functions/_lib/commentEvents";

interface CommentEventConsumerEnv {
  DB: D1Database;
}

export default {
  async queue(
    batch: MessageBatch<CommentAuditEvent>,
    env: CommentEventConsumerEnv
  ): Promise<void> {
    for (const message of batch.messages) {
      const event = message.body;
      if (!isCommentAuditEvent(event)) {
        console.warn("skipping invalid comment event", event);
        continue;
      }

      await recordAuditLogEntry(env, event.actor, {
        ...event.audit,
        eventId: event.id,
      }, event.request);
    }
  },
};
