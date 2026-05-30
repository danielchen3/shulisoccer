UPDATE matchStats
SET events = json_insert(
  events,
  '$[#]',
  json_object('round', '友谊赛 3.15', 'left', '树礼书院', 'score', '6 : 2', 'right', '致仁书院'),
  '$[#]',
  json_object('round', '友谊赛 3.7', 'left', '树礼书院', 'score', '2 : 0', 'right', '树仁书院'),
  '$[#]',
  json_object('round', '友谊赛 2.29', 'left', '树礼书院', 'score', '4 : 3', 'right', '致诚书院')
)
WHERE year = '2026书院杯';
