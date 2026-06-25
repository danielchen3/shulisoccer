-- Defensive migration for production databases whose migration history may
-- differ from local CI. Login needs sessions; audit logs should exist but
-- should not block auth.

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  playerId INTEGER NOT NULL,
  tokenHash TEXT NOT NULL UNIQUE,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expiresAt TEXT NOT NULL,
  lastSeenAt TEXT,
  userAgent TEXT,
  ipAddress TEXT,
  FOREIGN KEY (playerId) REFERENCES players(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_player_id ON sessions(playerId);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expiresAt);

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
