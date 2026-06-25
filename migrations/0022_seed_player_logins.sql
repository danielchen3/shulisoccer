-- Initial player login seed.
-- Username is the current player filename.
-- Initial password convention is "<filename>_123".
-- Passwords are stored as salted PBKDF2-SHA256 hashes, not plaintext.

UPDATE players SET username = 'ccx', passwordHash = 'pbkdf2_sha256$120000$3o_WPgpt0h58VuwUTRL77Q$BRXehbkf7RrYKZE1S5HRcliGSAgdIH8mgFzP8moyBsk', role = 'admin', loginEnabled = 1 WHERE filename = 'ccx';
UPDATE players SET username = 'cyq', passwordHash = 'pbkdf2_sha256$120000$rZAbQm4DhGOXEOZ680n3ew$qxnnGqj5Ai0TFAMABG-6RW60t5wPlkte573qd2YTs4I', role = 'player', loginEnabled = 1 WHERE filename = 'cyq';
UPDATE players SET username = 'czp', passwordHash = 'pbkdf2_sha256$120000$sOQ_Ec_GDp1IS48xVrLDGw$kud8J0CkTYURtZTQ1VwBX8W6TtbUvfxHbrs29x8CIsc', role = 'player', loginEnabled = 1 WHERE filename = 'czp';
UPDATE players SET username = 'dlr', passwordHash = 'pbkdf2_sha256$120000$C-HfJauQqd2iunshDHg35Q$fXmYTL5zZpVwJsFrHK0W9JGlO4nM-AJGZDATAgf_HQg', role = 'player', loginEnabled = 1 WHERE filename = 'dlr';
UPDATE players SET username = 'dmx', passwordHash = 'pbkdf2_sha256$120000$8-67KQEk-sIPnfLnyG1sCA$0joTjnuGBJcC33bikbG71zjmwa4qEyJtdae9tvChDCs', role = 'player', loginEnabled = 1 WHERE filename = 'dmx';
UPDATE players SET username = 'hht', passwordHash = 'pbkdf2_sha256$120000$pZ77z5W4CmAaCmtvg0Bihg$KXY7lVCgLuYCNh5c_eKsnV9zjeV5w-doa7ExVGswFWg', role = 'player', loginEnabled = 1 WHERE filename = 'hht';
UPDATE players SET username = 'hjh', passwordHash = 'pbkdf2_sha256$120000$j8QpciGJ_ayP27AHZPIBVA$rR93zpuIZt7OhXDYu4bCUlExQhvGqFR04hDd-C7-8-A', role = 'player', loginEnabled = 1 WHERE filename = 'hjh';
UPDATE players SET username = 'hyc', passwordHash = 'pbkdf2_sha256$120000$rwwIb6vQ5zSoSA9RZQ_UqQ$maJ-ebBuL7VgtmMP2KHy5nFOzhW_5QsUKwrM722bWSI', role = 'player', loginEnabled = 1 WHERE filename = 'hyc';
UPDATE players SET username = 'hzy', passwordHash = 'pbkdf2_sha256$120000$t3oUfb7_-CPES-OqXpHE0Q$0-tc9b1l6LErXRf8buJHYca82TkQS-DF7GDxvfjSkTU', role = 'player', loginEnabled = 1 WHERE filename = 'hzy';
UPDATE players SET username = 'lds', passwordHash = 'pbkdf2_sha256$120000$o3RqQftdNtfk4yoQVgLdiQ$jD_tzfqsA_j6MA9j6UqW01gu82azLH4cm8mhm4qQ5u4', role = 'player', loginEnabled = 1 WHERE filename = 'lds';
UPDATE players SET username = 'ljh', passwordHash = 'pbkdf2_sha256$120000$SJKEi5vxPlu-zVTJpqyuzQ$oyoFJePnLMknAFx23sSmlyyDUqWUya3OsxBEBkWhrmU', role = 'player', loginEnabled = 1 WHERE filename = 'ljh';
UPDATE players SET username = 'ljy', passwordHash = 'pbkdf2_sha256$120000$VeIE8rleGRj8b8e44Oyocw$hUFrtsGj7oIzIReLLOQ3WwcaoxSEITBb-RT-FBiZkVI', role = 'player', loginEnabled = 1 WHERE filename = 'ljy';
UPDATE players SET username = 'lx', passwordHash = 'pbkdf2_sha256$120000$GkjF1u0T2bSk51600AiLWQ$XBnr0NtQEOsPUgeTX5WWmUQZLLxNpZUul4QDX4qUinI', role = 'player', loginEnabled = 1 WHERE filename = 'lx';
UPDATE players SET username = 'mly', passwordHash = 'pbkdf2_sha256$120000$FG_yYSPMas7_ADqhcw-wZA$29YaZMcEOAYE6l3-CJNlCZ53LzM54ZPXW0_OTpPJB_M', role = 'player', loginEnabled = 1 WHERE filename = 'mly';
UPDATE players SET username = 'mym', passwordHash = 'pbkdf2_sha256$120000$uJVfmowmXLQ8KoQcIMFutg$XECYUv4kDSV7Nx1AxzDNy_DDd8gci8bXYNpliynL6rk', role = 'player', loginEnabled = 1 WHERE filename = 'mym';
UPDATE players SET username = 'pyc', passwordHash = 'pbkdf2_sha256$120000$N-91t4DF5ADKzgL7P3mokg$L6Zw3u0ugU2k-MbIH9ZinRfmoLgA0ZzbFujxuWnZjpI', role = 'player', loginEnabled = 1 WHERE filename = 'pyc';
UPDATE players SET username = 'qym', passwordHash = 'pbkdf2_sha256$120000$KqsD28EL7dmxKiomBLSKVA$hvKsKqejk07_TwSrOClrGx9epUQkPqcj4BaYp-At9g4', role = 'player', loginEnabled = 1 WHERE filename = 'qym';
UPDATE players SET username = 'shl', passwordHash = 'pbkdf2_sha256$120000$sepqMa6WlrYdJORvO0tq-g$huttySK3oKfR7tJukKQM49y8Ec7qBf05XJSKOTdbJdI', role = 'player', loginEnabled = 1 WHERE filename = 'shl';
UPDATE players SET username = 'syh', passwordHash = 'pbkdf2_sha256$120000$FgXvGdBJkjgeWYn60xrSHw$ETyJ7IJBSeWrU9UDbjHYt2gIuq9EjBtNjyMZJhPZAFo', role = 'player', loginEnabled = 1 WHERE filename = 'syh';
UPDATE players SET username = 'wky', passwordHash = 'pbkdf2_sha256$120000$6-RyGFNLopCr-2zN7VsWpQ$WJGMmqwZHXqScMHRNz-hoyupAvGr78yFjiHdY2H5uLQ', role = 'player', loginEnabled = 1 WHERE filename = 'wky';
UPDATE players SET username = 'wyk', passwordHash = 'pbkdf2_sha256$120000$PZs7r6lpFu14RmiVoeWB-g$7siJCzoabo2tCxTTeZqUdYK_cihSZlSTShqxFA24unI', role = 'player', loginEnabled = 1 WHERE filename = 'wyk';
UPDATE players SET username = 'yy', passwordHash = 'pbkdf2_sha256$120000$7AiH2DMFFVmsbo_KFrBT4A$yPWnNzvbE9OGAWnCwA9T7f_H8Kl-dsVhXa67Gq_y6x0', role = 'player', loginEnabled = 1 WHERE filename = 'yy';
UPDATE players SET username = 'zd', passwordHash = 'pbkdf2_sha256$120000$BTN2EEoW3sR5YBhguBEmXQ$0udBX3_yC8J9BdZlWObyuG9nVUTZF_7bWVZDvu-XEnc', role = 'player', loginEnabled = 1 WHERE filename = 'zd';
UPDATE players SET username = 'zh', passwordHash = 'pbkdf2_sha256$120000$bRG88yUBp1-JP6BXXV_lzA$qM4xI1Ka3alcUXftspJainnYw35HJ6onrY8LovgUrJc', role = 'player', loginEnabled = 1 WHERE filename = 'zh';
UPDATE players SET username = 'zhy', passwordHash = 'pbkdf2_sha256$120000$7TtGC_OXiE5SEVhsrnr4mQ$wZ5FmqUUNhCvVRadLSoueeywpm3USRB5DayBf2vdZAI', role = 'player', loginEnabled = 1 WHERE filename = 'zhy';
UPDATE players SET username = 'zjz1', passwordHash = 'pbkdf2_sha256$120000$OqCFRVGKG2uVTsEd7OchWw$frtiRjGSRAACN9QydFa5hxbqudcNLRLZ8Mhq6eb4Pc0', role = 'player', loginEnabled = 1 WHERE filename = 'zjz1';
UPDATE players SET username = 'zwh', passwordHash = 'pbkdf2_sha256$120000$oSLxierTybzk1QXs5ndGyw$iR-sOZTkZkSj1H2bsaH9QMK4S0ohooD2ZPk8p_K0-IE', role = 'player', loginEnabled = 1 WHERE filename = 'zwh';
UPDATE players SET username = 'zxa', passwordHash = 'pbkdf2_sha256$120000$4y6Mnvgecwzw3Qp3VFWMYQ$sNessBWxgUyAX6JNTKdlXNYbuHRKmHtdXSZAFTUZz_k', role = 'player', loginEnabled = 1 WHERE filename = 'zxa';
UPDATE players SET username = 'zxm', passwordHash = 'pbkdf2_sha256$120000$RsQZLn1elr20OTcNhMoaiw$F9UZjYvhsosZ5QYkxeS2--UbLDPcD3Tb5HbHLJHAwMg', role = 'player', loginEnabled = 1 WHERE filename = 'zxm';
UPDATE players SET username = 'zxt', passwordHash = 'pbkdf2_sha256$120000$MsqVQ730_PkXoviz3oFRQA$bdo9yM3H0Y6ZK6mwDPdGDjNjwUT-M8m__9zZfVGCAEM', role = 'player', loginEnabled = 1 WHERE filename = 'zxt';
