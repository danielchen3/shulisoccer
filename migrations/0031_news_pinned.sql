ALTER TABLE news ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0;

UPDATE news SET pinned = 1
WHERE date = '2026-06-30' AND content LIKE '%招新%';
