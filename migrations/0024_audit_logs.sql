CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actorPlayerId INTEGER,
  actorName TEXT,
  actorRole TEXT,
  action TEXT NOT NULL,
  resourceType TEXT NOT NULL,
  resourceId TEXT,
  details TEXT,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actorPlayerId) REFERENCES players(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
ON audit_logs(createdAt);

CREATE INDEX IF NOT EXISTS idx_audit_logs_resource
ON audit_logs(resourceType, resourceId);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor
ON audit_logs(actorPlayerId, createdAt);
