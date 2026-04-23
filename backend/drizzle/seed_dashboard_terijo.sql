-- Seed dashboard data for player 'Terijo' with opponent 'hyona'
-- Safe to run multiple times: player creation is guarded and game inserts are deduplicated
-- by (gameCreatedAt, gameMode) for this dataset.

BEGIN;

SET search_path TO public;

-- 1) Ensure both players exist (only inserted if missing)
INSERT INTO public.players ("mailAddress", "playerName", "pwd")
SELECT
  'terijo@gmail.com',
  'Terijo',
  '$2b$10$dashboard.seed.placeholder.hash'
WHERE NOT EXISTS (
  SELECT 1 FROM public.players WHERE "playerName" = 'Terijo' OR "mailAddress" = 'terijo@gmail.com'
);

INSERT INTO public.players ("mailAddress", "playerName", "pwd")
SELECT
  'hyona@gmail.com',
  'hyona',
  '$2b$10$dashboard.seed.placeholder.hash'
WHERE NOT EXISTS (
  SELECT 1 FROM public.players WHERE "playerName" = 'hyona' OR "mailAddress" = 'hyona@gmail.com'
);

-- 2) Define deterministic games for dashboard testing
WITH players_cte AS (
  SELECT
    MAX(CASE WHEN "playerName" = 'Terijo' THEN "playerId" END) AS terijo_id,
    MAX(CASE WHEN "playerName" = 'hyona' THEN "playerId" END) AS hyona_id
  FROM public.players
  WHERE "playerName" IN ('Terijo', 'hyona')
),
seed_rows AS (
  SELECT *
  FROM (
    VALUES
      ('2026-04-01 10:00:00'::timestamp, '2026-04-01 11:19:00'::timestamp, 'CLASSIC'::game_mode_enum, 'WIN'::game_result_enum,  'WHITE'::player_color_enum, 'WIN'::player_result_enum,  'LOSE'::player_result_enum, 44, 21),
      ('2026-04-02 14:00:00'::timestamp, '2026-04-02 14:11:00'::timestamp, 'BLITZ'::game_mode_enum,   'WIN'::game_result_enum,  'BLACK'::player_color_enum, 'WIN'::player_result_enum,  'LOSE'::player_result_enum, 30, 14),
      ('2026-04-03 19:30:00'::timestamp, '2026-04-03 19:54:00'::timestamp, 'CLASSIC'::game_mode_enum, 'WIN'::game_result_enum,  'WHITE'::player_color_enum, 'WIN'::player_result_enum,  'LOSE'::player_result_enum, 52, 27),
      ('2026-04-04 09:45:00'::timestamp, '2026-04-04 10:00:00'::timestamp, 'BULLET'::game_mode_enum,  'DRAW'::game_result_enum, 'BLACK'::player_color_enum, 'DRAW'::player_result_enum, 'DRAW'::player_result_enum, 18, 9),
      ('2026-04-05 17:20:00'::timestamp, '2026-04-05 17:45:00'::timestamp, 'CLASSIC'::game_mode_enum, 'WIN'::game_result_enum,  'WHITE'::player_color_enum, 'WIN'::player_result_enum,  'LOSE'::player_result_enum, 60, 28),
      ('2026-04-06 20:10:00'::timestamp, '2026-04-06 20:54:00'::timestamp, 'BLITZ'::game_mode_enum,   'WIN'::game_result_enum,  'BLACK'::player_color_enum, 'WIN'::player_result_enum,  'LOSE'::player_result_enum, 33, 15),
      ('2026-04-07 12:00:00'::timestamp, '2026-04-07 12:09:00'::timestamp, 'BULLET'::game_mode_enum,  'WIN'::game_result_enum,  'WHITE'::player_color_enum, 'WIN'::player_result_enum,  'LOSE'::player_result_enum, 16, 8),
      ('2026-04-08 21:05:00'::timestamp, '2026-04-08 21:19:00'::timestamp, 'BLITZ'::game_mode_enum,   'WIN'::game_result_enum,  'WHITE'::player_color_enum, 'WIN'::player_result_enum,  'LOSE'::player_result_enum, 35, 17),
      ('2026-04-09 08:40:00'::timestamp, '2026-04-09 08:54:00'::timestamp, 'CLASSIC'::game_mode_enum, 'DRAW'::game_result_enum, 'BLACK'::player_color_enum, 'DRAW'::player_result_enum, 'DRAW'::player_result_enum, 40, 20),
      ('2026-04-10 18:00:00'::timestamp, '2026-04-10 18:15:00'::timestamp, 'BULLET'::game_mode_enum,  'WIN'::game_result_enum,  'BLACK'::player_color_enum, 'WIN'::player_result_enum,  'LOSE'::player_result_enum, 20, 10)
  ) AS t(
    created_at,
    completed_at,
    game_mode,
    game_result,
    terijo_color,
    terijo_result,
    hyona_result,
    total_moves,
    winner_moves
  )
),
inserted_games AS (
  INSERT INTO public.games (
    "totalNbMoves",
    "winnerNbMoves",
    "gameCreatedAt",
    "gameCompletedAt",
    "gameStatus",
    "gameResult",
    "gameMode"
  )
  SELECT
    s.total_moves,
    s.winner_moves,
    s.created_at,
    s.completed_at,
    'COMPLETED',
    s.game_result,
    s.game_mode
  FROM seed_rows s
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.games g
    WHERE g."gameCreatedAt" = s.created_at
      AND g."gameMode" = s.game_mode
  )
  RETURNING "gameId", "gameCreatedAt", "gameMode"
),
all_target_games AS (
  SELECT g."gameId", s.terijo_color, s.terijo_result, s.hyona_result
  FROM public.games g
  INNER JOIN seed_rows s
    ON g."gameCreatedAt" = s.created_at
   AND g."gameMode" = s.game_mode
)
INSERT INTO public.participation ("playerId", "gameId", "playerResult", "playerColor")
SELECT p.terijo_id, tg."gameId", tg.terijo_result, tg.terijo_color
FROM all_target_games tg
CROSS JOIN players_cte p
WHERE p.terijo_id IS NOT NULL
ON CONFLICT DO NOTHING;

WITH players_cte AS (
  SELECT
    MAX(CASE WHEN "playerName" = 'Terijo' THEN "playerId" END) AS terijo_id,
    MAX(CASE WHEN "playerName" = 'hyona' THEN "playerId" END) AS hyona_id
  FROM public.players
  WHERE "playerName" IN ('Terijo', 'hyona')
),
seed_rows AS (
  SELECT *
  FROM (
    VALUES
      ('2026-04-01 10:00:00'::timestamp, 'CLASSIC'::game_mode_enum, 'WHITE'::player_color_enum, 'LOSE'::player_result_enum),
      ('2026-04-02 14:00:00'::timestamp, 'BLITZ'::game_mode_enum,   'BLACK'::player_color_enum, 'LOSE'::player_result_enum),
      ('2026-04-03 19:30:00'::timestamp, 'CLASSIC'::game_mode_enum, 'WHITE'::player_color_enum, 'LOSE'::player_result_enum),
      ('2026-04-04 09:45:00'::timestamp, 'BULLET'::game_mode_enum,  'BLACK'::player_color_enum, 'DRAW'::player_result_enum),
      ('2026-04-05 17:20:00'::timestamp, 'CLASSIC'::game_mode_enum, 'WHITE'::player_color_enum, 'LOSE'::player_result_enum),
      ('2026-04-06 20:10:00'::timestamp, 'BLITZ'::game_mode_enum,   'BLACK'::player_color_enum, 'LOSE'::player_result_enum),
      ('2026-04-07 12:00:00'::timestamp, 'BULLET'::game_mode_enum,  'WHITE'::player_color_enum, 'LOSE'::player_result_enum),
      ('2026-04-08 21:05:00'::timestamp, 'BLITZ'::game_mode_enum,   'WHITE'::player_color_enum, 'LOSE'::player_result_enum),
      ('2026-04-09 08:40:00'::timestamp, 'CLASSIC'::game_mode_enum, 'BLACK'::player_color_enum, 'DRAW'::player_result_enum),
      ('2026-04-10 18:00:00'::timestamp, 'BULLET'::game_mode_enum,  'BLACK'::player_color_enum, 'LOSE'::player_result_enum)
  ) AS t(created_at, game_mode, terijo_color, hyona_result)
),
all_target_games AS (
  SELECT g."gameId", s.terijo_color, s.hyona_result
  FROM public.games g
  INNER JOIN seed_rows s
    ON g."gameCreatedAt" = s.created_at
   AND g."gameMode" = s.game_mode
)
INSERT INTO public.participation ("playerId", "gameId", "playerResult", "playerColor")
SELECT
  p.hyona_id,
  tg."gameId",
  tg.hyona_result,
  CASE
    WHEN tg.terijo_color = 'WHITE'::player_color_enum THEN 'BLACK'::player_color_enum
    ELSE 'WHITE'::player_color_enum
  END
FROM all_target_games tg
CROSS JOIN players_cte p
WHERE p.hyona_id IS NOT NULL
ON CONFLICT DO NOTHING;

COMMIT;
