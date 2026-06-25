CREATE TABLE IF NOT EXISTS content_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  targetType TEXT NOT NULL,
  targetId TEXT NOT NULL,
  parentCommentId INTEGER,
  authorPlayerId INTEGER NOT NULL,
  body TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deletedAt TEXT,
  FOREIGN KEY (parentCommentId) REFERENCES content_comments(id) ON DELETE CASCADE,
  FOREIGN KEY (authorPlayerId) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS content_comment_reactions (
  commentId INTEGER NOT NULL,
  playerId INTEGER NOT NULL,
  reaction TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (commentId, playerId, reaction),
  FOREIGN KEY (commentId) REFERENCES content_comments(id) ON DELETE CASCADE,
  FOREIGN KEY (playerId) REFERENCES players(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_content_comments_target
ON content_comments(targetType, targetId, deletedAt, createdAt);

CREATE INDEX IF NOT EXISTS idx_content_comments_parent
ON content_comments(parentCommentId, deletedAt, createdAt);

CREATE INDEX IF NOT EXISTS idx_content_comment_reactions_comment
ON content_comment_reactions(commentId, reaction);
