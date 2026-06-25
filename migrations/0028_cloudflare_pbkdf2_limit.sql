-- Cloudflare Workers supports PBKDF2 iteration counts up to 100000.
-- Earlier seeded default passwords used 120000 iterations, which cannot be
-- verified in production. Re-hash the initial "<username>_123" passwords with
-- 100000 iterations while leaving any already-reset passwords untouched.

UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$sAk8qpnUXJ-Q5M_t7XgYvQ$P72-H_hBwDT52ewGjlEHkmOpoYz9IqVjc280zO94G0w' WHERE username = 'ccx' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$TqvY923CfMZrMMyho-tJ1A$JY9-4iT3mbnew2yxHwyw3HJYy8Phnt0gbFQQTdWpwDA' WHERE username = 'cyq' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$oY0F6Z1ZL_dNYA9pNM1MZw$ac0Gbqy_XuyZ1941dvpg8eF2k0wlzwkEsjAKRgXUFc8' WHERE username = 'czp' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$IrLgWxNQugSU-n905-RPXQ$9advdgW_f95pHmwFP5_4g88jztBqeaLqtL6OSByvwvc' WHERE username = 'dlr' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$MgJOpgrE4_9YlOXrNI_pgA$04MVRR_8EOLYrP60AN2TepsL6KWh2McgAsGGp993f1k' WHERE username = 'dmx' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$exV2HZKhwEEOQb4eShEKFw$0HnTjD9w1tbLgWtl8UPcnMSqs_fQ2IHAHDl1joloz10' WHERE username = 'hht' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$mWa320NNI1ishdiX-mFGAg$jHlfFXmys52mH6S54pOqdBe2OvEGs6RtB1ZRXUGGYmk' WHERE username = 'hjh' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$1cZg6AxJWHgX8BAAB4jhaw$C8FaElkTOuATTT3z6x3--woxboCw_TEXN9hdijt6dpQ' WHERE username = 'hyc' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$mTa7QJ1lm1H670kUUie80A$ZegYeoBeEypYuwCIKc7OTteZ1dQuNqAHHH8oTh3w5wY' WHERE username = 'hzy' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$-mn7KSvQD3E7MycaZon7Ug$79asbid9qM0pxfCOK5QTkOK1TcnAWt-HgLlE1NTjfPs' WHERE username = 'lds' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$sFcsqBiOmR2GwKc3GohFyQ$tFmdhdBRvI0agkjrwL4FDvZF7nRnCguOkBrqUK03SvQ' WHERE username = 'ljh' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$tn2Wh4qlc_Ej-X6ZWv3QoA$ug6Xu5gjynBLwUoSTXC1agyuZjsrjcfjfxVQ6Bz9Q4E' WHERE username = 'ljy' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$c-EY9SBwTjmxXXMILCFr-A$rk-MBlWQw30kBMR6vq_R2pBgDdlYjbORKm1Id3rGVRk' WHERE username = 'lx' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$T_fwBv2S7YXxNbHhoWPqYw$V8XwX8WTyMgPbUicKuhj7bu3qIjbCcmwoMIjWgx-51I' WHERE username = 'mly' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$gvTOmWFyQA236jeyZ8T2dQ$eXZokBPhSBJyxzs5Z16D_cswR7V3c5vTPS5vPR2gF9g' WHERE username = 'mym' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$di2Kl9YXE-dj-7DbyKp9-A$QcIUgQ5Ef30yUH3L1ujrFRxRCihBmeoqB6e8c4ITw3E' WHERE username = 'pyc' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$6xNuftU3TLyOF5W-Gq_eOA$I-sQdo-6b5UcmmfZHU87sYWXpq7pzHtyBll53MQmpc0' WHERE username = 'qym' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$qPQTDkl8p_Q_CCkD59BYyg$cJcLx35OrJLZBJaTdneAXiPfuvj3jSSzLgmET94C71k' WHERE username = 'shl' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$RSfii_JciAs4iQqq1Lo39A$mfLYM_4uGtlMT-YRZ0OuKcQTF0lM0HpccXcVhvHIJKg' WHERE username = 'syh' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$pSFTecHznLikE7qGVlTlFg$DVpBNaqUY6oZ92HHIuJ1H9ecDAQNIGbemm3q_ssliDM' WHERE username = 'wky' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$dR_1s-jdAc_lSHXJ8dR_Gg$pX-8xtkGaxq-rtws-M7rg4AjlDwKx_JR1x6T1BF1JO4' WHERE username = 'wyk' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$kaYXMY7ygKGLgioCzHU8Og$J1nwKHCVvXr3nx2X4EEB41m2Kwmnjmx87FvU8mDPy2A' WHERE username = 'yy' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$_oPPewiiXOOQmcCJ9iersw$XAu_OEaMbKC2Wno7B8gK233MpeesFrPScNj8ej9BnvU' WHERE username = 'zd' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$M7BkL9A8PzyxpB3li2ORFQ$pqK9Wd3wgLb39PUBxYLh8yt6mSB2KnN7IFLUebQE3Xk' WHERE username = 'zh' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$-zosTfjkWVKOOMdUVZTF5Q$e1yrlmyahtrVrQ9BO9U7Y_7zhVPGvrhCZclQSTtLJ5M' WHERE username = 'zhy' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$p1t1xDFSyPNnAJV6hV0nlg$XTlciPlk729-QxGzYB5JAO3wb9pjYyLv-LrLhSKxuUs' WHERE username = 'zjz1' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$KOGxC1JS2d4LMAL7IIFrBA$1Y1f0-u-7A0X0ybZauPEsaDJYybiBNIQJofweNMaXYo' WHERE username = 'zwh' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$_YWZpj1H7DeCT47NoR8T-Q$6RjzJYBzlSBKIQoThVZ-uJFEXNWQyPVvGBxKNhK_ALo' WHERE username = 'zxa' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$m5hGgbnkcFMPVxIfcXacBg$Y_Uo0WtfbrenT_csoAzskUjkuAyQuSiF8AR44NoQlRw' WHERE username = 'zxm' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
UPDATE players SET passwordHash = 'pbkdf2_sha256$100000$G4_TMwRxsVieDT3lxYfxSw$BJiuAdfz1FNM-ciUUL3A-Tj62kdzfLB5IWjYUDpSCZc' WHERE username = 'zxt' AND passwordHash LIKE 'pbkdf2_sha256$120000$%';
