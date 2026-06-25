-- Keep fresh CI/local databases bootstrappable even when legacy player data
-- was not imported outside migrations.

INSERT INTO players (
  positionGroup,
  position,
  number,
  filename,
  name,
  enName,
  club,
  nationality,
  nationalityFlag,
  province,
  age,
  birthday,
  height,
  weight,
  foot,
  starts,
  subs,
  goals,
  username,
  passwordHash,
  role,
  loginEnabled
)
SELECT
  'midfield',
  '中场',
  8,
  'ccx',
  '陈长信',
  'Changxin Chen',
  'Shuli FC',
  'China',
  '',
  '',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  'ccx',
  'pbkdf2_sha256$120000$3o_WPgpt0h58VuwUTRL77Q$BRXehbkf7RrYKZE1S5HRcliGSAgdIH8mgFzP8moyBsk',
  'admin',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM players WHERE filename = 'ccx'
);

UPDATE players
SET
  username = 'ccx',
  passwordHash = 'pbkdf2_sha256$120000$3o_WPgpt0h58VuwUTRL77Q$BRXehbkf7RrYKZE1S5HRcliGSAgdIH8mgFzP8moyBsk',
  role = 'admin',
  loginEnabled = 1
WHERE filename = 'ccx';
