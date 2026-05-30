UPDATE matchStats
SET events = json_set(
  events,
  '$[3].starters',
  json_array(
    '6 马麓原',
    '7 张瀚元',
    '8 陈长信',
    '9 邱彦鸣',
    '10 郑袭明',
    '11 张熙泰',
    '19 沈泓立',
    '20 胡雨承',
    '22 张锦泽',
    '25 戴铭希',
    '38 贺梓尧'
  ),
  '$[3].timeline',
  json_array(
    json_object(
      'type', 'goal',
      'minute', 13,
      'side', 'left',
      'team', '树礼书院',
      'player', '19号 沈泓立'
    ),
    json_object(
      'type', 'substitution',
      'minute', 20,
      'side', 'right',
      'team', '致诚书院',
      'playersIn', json_array('31号 许可睿'),
      'playersOut', json_array('12号 蔡哲熙')
    ),
    json_object(
      'type', 'substitution',
      'minute', 20,
      'side', 'left',
      'team', '树礼书院',
      'playersIn', json_array('12号 庞宇程'),
      'playersOut', json_array('9号 邱彦鸣')
    ),
    json_object(
      'type', 'yellow_card',
      'minute', 45,
      'side', 'left',
      'team', '树礼书院',
      'player', '12号 庞宇程'
    ),
    json_object(
      'type', 'half_time',
      'score', '1-0'
    ),
    json_object(
      'type', 'yellow_card',
      'minute', 48,
      'side', 'left',
      'team', '树礼书院',
      'player', '20号 胡雨承'
    ),
    json_object(
      'type', 'yellow_card',
      'minute', 51,
      'side', 'left',
      'team', '树礼书院',
      'player', '6号 马麓原'
    ),
    json_object(
      'type', 'goal',
      'minute', 54,
      'side', 'right',
      'team', '致诚书院',
      'player', '16号 苏政逸'
    ),
    json_object(
      'type', 'substitution',
      'minute', 60,
      'side', 'right',
      'team', '致诚书院',
      'playersIn', json_array('30号 高若暄'),
      'playersOut', json_array('8号 张恩铭')
    ),
    json_object(
      'type', 'substitution',
      'minute', 60,
      'side', 'left',
      'team', '树礼书院',
      'playersIn', json_array('53号 张文豪', '4号 黄锦昊', '14号 周玹安'),
      'playersOut', json_array('19号 沈泓立', '8号 陈长信', '20号 胡雨承')
    ),
    json_object(
      'type', 'yellow_card',
      'minute', 67,
      'side', 'right',
      'team', '致诚书院',
      'player', '79号 汪江瀚'
    ),
    json_object(
      'type', 'substitution',
      'minute', 70,
      'side', 'right',
      'team', '致诚书院',
      'playersIn', json_array('77号 王如鑫'),
      'playersOut', json_array('19号 金秉乐')
    ),
    json_object(
      'type', 'substitution',
      'minute', 70,
      'side', 'left',
      'team', '树礼书院',
      'playersIn', json_array('61号 张涵', '15号 史衍昊'),
      'playersOut', json_array('7号 张瀚元', '10号 郑袭明')
    )
  )
)
WHERE year = '2026书院杯';
