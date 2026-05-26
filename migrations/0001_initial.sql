-- ============================================================
-- Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS players (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  positionGroup TEXT    NOT NULL,
  position      TEXT    NOT NULL,
  number        INTEGER,
  filename      TEXT,
  name          TEXT,
  enName        TEXT,
  club          TEXT,
  nationality   TEXT,
  nationalityFlag TEXT,
  province      TEXT,
  age           INTEGER,
  birthday      TEXT,
  height        INTEGER,
  weight        INTEGER,
  foot          TEXT,
  starts        INTEGER DEFAULT 0,
  subs          INTEGER DEFAULT 0,
  goals         INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS retiredPlayers (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT,
  name     TEXT,
  position TEXT,
  age      INTEGER,
  height   INTEGER,
  weight   INTEGER,
  foot     TEXT
);

-- events 列存 JSON 数组（含每场比赛的 round/left/score/right 及可选 video）
-- sortOrder 越小越靠前（最新赛季排第一）
CREATE TABLE IF NOT EXISTS matchStats (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  sortOrder  INTEGER NOT NULL DEFAULT 0,
  year       TEXT    NOT NULL,
  medal      TEXT,
  videoLabel TEXT,
  videoUrl   TEXT,
  events     TEXT    NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS news (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  date    TEXT NOT NULL,
  content TEXT NOT NULL,
  image   TEXT
);

CREATE TABLE IF NOT EXISTS topScorers (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT    NOT NULL,
  goals INTEGER NOT NULL
);

