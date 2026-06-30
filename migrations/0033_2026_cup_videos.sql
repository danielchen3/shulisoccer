UPDATE matchStats
SET events = json_set(
  events,
  '$[1].video', json_object('label', '比赛集锦', 'url', 'https://www.bilibili.com/video/BV14XEc6hErM'),
  '$[2].video', json_object('label', '比赛集锦', 'url', 'https://www.bilibili.com/video/BV12wGd6aEPQ'),
  '$[3].video', json_object('label', '比赛集锦', 'url', 'https://www.bilibili.com/video/BV1eJLS6qErh')
)
WHERE year = '2026书院杯';
