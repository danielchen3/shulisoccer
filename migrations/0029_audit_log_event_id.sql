ALTER TABLE audit_logs ADD COLUMN eventId TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_audit_logs_event_id
  ON audit_logs(eventId)
  WHERE eventId IS NOT NULL;
