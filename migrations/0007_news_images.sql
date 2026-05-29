-- 给 5.16 新闻设置封面图
UPDATE news SET image = 'assets/news/final-2526.jpg' WHERE date = '2026-05-16' AND content LIKE '%25-26赛季%';

-- recruitment.jpg 迁移到 news 文件夹，更新所有引用
UPDATE news SET image = 'assets/news/recruitment.jpg' WHERE image = 'assets/recruitment.jpg';
