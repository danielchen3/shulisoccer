UPDATE matchStats
SET events = json_set(
  events,
  '$[0].starters',
  json_array(
    '4 黄锦昊',
    '6 马麓原',
    '7 张瀚元',
    '8 陈长信',
    '10 郑袭明',
    '12 庞宇程',
    '15 史衍昊',
    '19 沈泓立',
    '20 胡雨承',
    '22 张锦泽',
    '25 戴铭希'
  ),
  '$[0].timeline',
  json_array(
    json_object(
      'type', 'goal',
      'minute', 29,
      'side', 'left',
      'team', '致诚书院',
      'player', '10号 苏坦'
    ),
    json_object(
      'type', 'goal',
      'minute', 43,
      'side', 'left',
      'team', '致诚书院',
      'player', '5号 黄文俊'
    ),
    json_object(
      'type', 'half_time',
      'score', '2-0'
    ),
    json_object(
      'type', 'substitution',
      'minute', 46,
      'side', 'right',
      'playersIn', json_array('61号 张涵', '99号 胡皓天'),
      'playersOut', json_array('7号 张瀚元', '25号 戴铭希')
    ),
    json_object(
      'type', 'yellow_card',
      'minute', 47,
      'side', 'right',
      'team', '树礼书院',
      'player', '19号 沈泓立'
    ),
    json_object(
      'type', 'goal',
      'minute', 57,
      'side', 'left',
      'team', '致诚书院',
      'player', '11号 熊从越'
    ),
    json_object(
      'type', 'substitution',
      'minute', 60,
      'side', 'left',
      'playersIn', json_array('77号 王如鑫', '14号 江南', '31号 许可睿'),
      'playersOut', json_array('25号 陈相昕', '12号 蔡哲熙', '19号 金秉乐')
    ),
    json_object(
      'type', 'goal',
      'minute', 64,
      'side', 'left',
      'team', '致诚书院',
      'player', '15号 史衍昊'
    ),
    json_object(
      'type', 'substitution',
      'minute', 65,
      'side', 'right',
      'playersIn', json_array('16号 董力睿'),
      'playersOut', json_array('20号 胡雨承')
    ),
    json_object(
      'type', 'substitution',
      'minute', 70,
      'side', 'right',
      'playersIn', json_array('11号 张熙泰'),
      'playersOut', json_array('15号 史衍昊')
    ),
    json_object(
      'type', 'substitution',
      'minute', 75,
      'side', 'left',
      'playersIn', json_array('30号 高若暄'),
      'playersOut', json_array('10号 苏坦')
    ),
    json_object(
      'type', 'substitution',
      'minute', 80,
      'side', 'right',
      'playersIn', json_array('53号 张文豪'),
      'playersOut', json_array('8号 陈长信')
    ),
    json_object(
      'type', 'substitution',
      'minute', 85,
      'side', 'left',
      'playersIn', json_array('8号 张恩铭', '22号 陆籽诺'),
      'playersOut', json_array('16号 苏政逸', '11号 熊从越')
    )
  )
)
WHERE year = '2026书院杯';
