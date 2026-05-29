UPDATE matchStats
SET events = REPLACE(events, '小组赛第三轮第二场', '小组赛第三轮')
WHERE year = '2026书院杯';
