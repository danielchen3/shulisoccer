-- Add new columns from 个人信息.xlsx collection
ALTER TABLE retiredPlayers ADD COLUMN birthday TEXT;
ALTER TABLE retiredPlayers ADD COLUMN number INTEGER;
ALTER TABLE retiredPlayers ADD COLUMN province TEXT;
ALTER TABLE retiredPlayers ADD COLUMN classYear INTEGER;

-- Update existing retired players with collected info
UPDATE retiredPlayers SET birthday='2002-10-27', number=34, province='安徽合肥', classYear=2020, position='前锋' WHERE name='吴嘉木';
UPDATE retiredPlayers SET birthday='2002-11-07', number=66, province='湖南长沙', classYear=2020, position='中后卫，边后卫', weight=71 WHERE name='潘雷';
UPDATE retiredPlayers SET birthday='2000-05-14', number=10, province='贵州贵阳', classYear=2019, position='后腰，前腰', weight=72 WHERE name='彭奕豪';
UPDATE retiredPlayers SET birthday='2002-10-03', number=14, province='河南南阳', classYear=2020, weight=85 WHERE name='李宗尧';
UPDATE retiredPlayers SET birthday='1999-03-15', number=11, province='四川绵竹', classYear=2016, position='中锋，右边锋', goals=7, height=178, weight=63 WHERE name='吕派';
UPDATE retiredPlayers SET birthday='2000-08-19', number=5, province='广东佛山', classYear=2018 WHERE name='吴迪';
UPDATE retiredPlayers SET birthday='2002-03-05', number=6, province='安徽淮南', classYear=2020, position='中场', weight=88 WHERE name='汪欣然';
UPDATE retiredPlayers SET birthday='1997-03-14', number=9, province='陕西安康', classYear=2015, position='中锋', height=176, weight=60 WHERE name='王季平';

-- Insert new retired players from Excel
INSERT INTO retiredPlayers (filename, name, position, goals, height, weight, birthday, number, province, classYear) VALUES
  ('hjh_r', '韩金衡', '中后卫', 1, 170, 80, '1997-04-28', 13, '河南洛阳', 2015),
  ('lxun',  '李荀',   '门将',   0, 173, 100, '1999-12-19', 19, '重庆', 2018),
  ('tlz',   '托雷之', '后腰，门将，左边后卫', 0, 181, 75, '1998-01-28', 25, '福建泉州/宁夏固原', 2015),
  ('yxm',   '叶曦珉', '后腰，中后卫', 1, 172, 75, '2003-10-06', 17, '安徽铜陵', 2021),
  ('lzp',   '林志芃', '右后卫', 0, 176, 60, '2002-11-07', 21, '广东广州', 2021),
  ('zzy',   '赵梓源', '左后卫，右后卫', 0, 178, 74, '2000-10-31', 8, '辽宁大连', 2018),
  ('byt',   '白宇童', '中后卫，边后卫', 0, 174, 75, '1997-05-10', 15, '四川绵阳', 2015),
  ('lwc',   '林文春', '前锋',   0, 173, 65, '1997-06-01', 6, '广西玉林', 2015),
  ('zjr',   '张隽睿', '中场',   0, 174, 65, '1997-07-08', 17, '河南南阳', 2015),
  ('lq',    '刘琪',   '门将',   0, 183, 83, '1998-06-30', 99, '陕西西安', 2016);
