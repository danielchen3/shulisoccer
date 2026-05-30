DELETE FROM players
WHERE LOWER(TRIM(enName)) IN ('ximin ye', 'dinan chu', 'linyuan xue')
   OR filename IN ('yxm', 'cdn', 'xly');
