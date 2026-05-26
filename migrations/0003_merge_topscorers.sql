-- ============================================================
-- 0003_merge_topscorers.sql
-- Merge topScorers data into players/retiredPlayers, then drop topScorers.
-- After this migration, the top-scorers ranking is computed from
--   players.goals UNION retiredPlayers.goals
-- ============================================================

-- 1. Add goals column to retiredPlayers
ALTER TABLE retiredPlayers ADD COLUMN goals INTEGER NOT NULL DEFAULT 0;

-- 2. Set goals for existing retired players (from topScorers)
UPDATE retiredPlayers SET goals = 1 WHERE name = '潘雷';
UPDATE retiredPlayers SET goals = 1 WHERE name = '彭奕豪';
UPDATE retiredPlayers SET goals = 1 WHERE name = '吴嘉木';

-- 3. Insert retired players who were only in topScorers
INSERT INTO retiredPlayers (filename, name, position, goals) VALUES
  ('le',  '李恩',   '前锋', 21),
  ('lp',  '吕派',   '前锋', 5),
  ('hjj', '胡嘉健', '未知', 1),
  ('wjp', '王季平', '未知', 1);

-- 4. Fix current player 张文豪: topScorers had 2 goals but players had 0
UPDATE players SET goals = 2 WHERE filename = 'zwh';

-- 5. Drop the now-redundant topScorers table
DROP TABLE IF EXISTS topScorers;
