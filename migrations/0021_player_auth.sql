-- Add first-class authentication fields to current players.
-- A player becomes a login-capable user only after username/passwordHash are set.

ALTER TABLE players ADD COLUMN username TEXT;
ALTER TABLE players ADD COLUMN passwordHash TEXT;
ALTER TABLE players ADD COLUMN role TEXT NOT NULL DEFAULT 'player';
ALTER TABLE players ADD COLUMN loginEnabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE players ADD COLUMN lastLoginAt TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_players_username
ON players(username)
WHERE username IS NOT NULL;

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
