CREATE TABLE IF NOT EXISTS discussion_threads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  authorPlayerId INTEGER NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  pinned INTEGER NOT NULL DEFAULT 0,
  locked INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deletedAt TEXT,
  FOREIGN KEY (authorPlayerId) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS discussion_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  threadId INTEGER NOT NULL,
  authorPlayerId INTEGER NOT NULL,
  body TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deletedAt TEXT,
  FOREIGN KEY (threadId) REFERENCES discussion_threads(id) ON DELETE CASCADE,
  FOREIGN KEY (authorPlayerId) REFERENCES players(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_discussion_threads_active
ON discussion_threads(deletedAt, pinned, updatedAt);

CREATE INDEX IF NOT EXISTS idx_discussion_threads_category
ON discussion_threads(category, deletedAt, updatedAt);

CREATE INDEX IF NOT EXISTS idx_discussion_comments_thread
ON discussion_comments(threadId, deletedAt, createdAt);
