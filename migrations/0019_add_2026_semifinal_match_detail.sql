UPDATE matchStats
SET events = json_set(
  events,
  '$[1].starters',
  json_array(
    '6 马麓原',
    '7 张瀚元',
    '8 陈长信',
    '10 郑袭明',
    '11 张熙泰',
    '19 沈泓立',
    '20 胡雨承',
    '22 张锦泽',
    '24 陈子佩',
    '25 戴铭希',
    '38 贺梓尧'
  ),
  '$[1].timeline',
  json_array(
    json_object(
      'type', 'yellow_card',
      'minute', 11,
      'side', 'left',
      'team', '树礼书院',
      'player', '24号 陈子佩'
    ),
    json_object(
      'type', 'yellow_card',
      'minute', 16,
      'side', 'left',
      'team', '树礼书院',
      'player', '7号 张瀚元'
    ),
    json_object(
      'type', 'goal',
      'minute', 43,
      'side', 'left',
      'team', '树礼书院',
      'player', '6号 马麓原'
    ),
    json_object(
      'type', 'half_time',
      'score', '1-0'
    ),
    json_object(
      'type', 'substitution',
      'minute', 46,
      'side', 'right',
      'playersIn', json_array('14号 钱儒锟'),
      'playersOut', json_array('20号 魏栩钊')
    ),
    json_object(
      'type', 'substitution',
      'minute', 51,
      'side', 'left',
      'playersIn', json_array('4号 黄锦昊'),
      'playersOut', json_array('38号 贺梓尧')
    ),
    json_object(
      'type', 'yellow_card',
      'minute', 54,
      'side', 'left',
      'team', '树礼书院',
      'player', '10号 郑袭明'
    ),
    json_object(
      'type', 'substitution',
      'minute', 56,
      'side', 'left',
      'playersIn', json_array('15号 史衍昊', '12号 庞宇程'),
      'playersOut', json_array('11号 张熙泰', '20号 胡雨承')
    ),
    json_object(
      'type', 'substitution',
      'minute', 59,
      'side', 'right',
      'playersIn', json_array('88号 Batyrbekov Maksat'),
      'playersOut', json_array('5号 马烨恒')
    ),
    json_object(
      'type', 'goal',
      'minute', 68,
      'side', 'right',
      'player', '88号 Batyrbekov Maksat'
    ),
    json_object(
      'type', 'yellow_card',
      'minute', 73,
      'side', 'right',
      'player', '4号 闫可为'
    ),
    json_object(
      'type', 'red_card',
      'minute', 73,
      'side', 'left',
      'team', '树礼书院',
      'player', '24号 陈子佩'
    ),
    json_object(
      'type', 'substitution',
      'minute', 76,
      'side', 'left',
      'playersIn', json_array('53号 张文豪', '14号 周玹安'),
      'playersOut', json_array('8号 陈长信', '7号 张瀚元')
    ),
    json_object(
      'type', 'substitution',
      'minute', 79,
      'side', 'right',
      'playersIn', json_array('17号 赵子悦'),
      'playersOut', json_array('4号 闫可为')
    ),
    json_object(
      'type', 'goal',
      'minute', 80,
      'side', 'left',
      'team', '树礼书院',
      'player', '15号 史衍昊'
    )
  )
)
WHERE year = '2026书院杯';
