-- Shift existing rows down to make room after 2026书院杯 (sortOrder=0)
UPDATE matchStats SET sortOrder = sortOrder + 1 WHERE sortOrder >= 1;

INSERT INTO matchStats (sortOrder, year, medal, events) VALUES
(1, '2026新生赛', '🥇', '[{"round":"决赛","left":"树礼书院","score":"0 : 0 (4 : 2)","right":"致诚书院"},{"round":"第二场","left":"树礼书院","score":"4 : 2","right":"研究生"},{"round":"第一场","left":"树礼书院","score":"0 : 0","right":"致仁书院","video":{"label":"比赛集锦","url":"https://www.bilibili.com/video/BV1g5inBcEJ8"}}]');
