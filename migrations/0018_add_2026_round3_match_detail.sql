UPDATE matchStats
SET events = json_set(
  events,
  '$[2].starters',
  json_array(
    '6 马麓原',
    '7 张瀚元',
    '8 陈长信',
    '10 郑袭明',
    '11 张熙泰',
    '12 庞宇程',
    '19 沈泓立',
    '22 张锦泽',
    '24 陈子佩',
    '25 戴铭希',
    '38 贺梓尧'
  ),
  '$[2].timeline',
  json_array(
    json_object(
      'type', 'goal',
      'minute', 3,
      'side', 'left',
      'team', '树礼书院',
      'player', '19号 沈泓立'
    ),
    json_object(
      'type', 'goal',
      'minute', 6,
      'side', 'left',
      'team', '树礼书院',
      'player', '6号 马麓原'
    ),
    json_object(
      'type', 'half_time',
      'score', '2-0'
    ),
    json_object(
      'type', 'substitution',
      'minute', 53,
      'side', 'right',
      'playersIn', json_array('10号 郭靖恺', '3号 徐梓恒'),
      'playersOut', json_array('45号 姚远', '38号 黄政宁')
    ),
    json_object(
      'type', 'substitution',
      'minute', 66,
      'side', 'right',
      'playersIn', json_array('11号 张云帆', '41号 叶可乐'),
      'playersOut', json_array('92号 夏天', '24号 付雨桐')
    ),
    json_object(
      'type', 'yellow_card',
      'minute', 69,
      'side', 'right',
      'player', '10号 郭靖恺'
    ),
    json_object(
      'type', 'substitution',
      'minute', 70,
      'side', 'left',
      'playersIn', json_array('20号 胡雨承'),
      'playersOut', json_array('12号 庞宇程')
    ),
    json_object(
      'type', 'substitution',
      'minute', 82,
      'side', 'left',
      'playersIn', json_array('23号 刘佳宏', '14号 周玹安'),
      'playersOut', json_array('11号 张熙泰', '7号 张瀚元')
    )
  )
)
WHERE year = '2026书院杯';
