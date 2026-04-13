-- Seed dashboard data for player 'Terijo' with opponent 'Hyona'
-- Safe to run multiple times: player creation is guarded and game inserts are deduplicated
-- by (gameCreatedAt, gameMode) for this dataset.
-- This dataset contains 20 games with an even split of wins:
-- 8 for Terijo, 8 for hyona, and 4 draws.

BEGIN;

SET search_path TO public;

-- 0) Reset the dashboard dataset for these two players
DELETE FROM public.participation p
WHERE p."playerId" IN (
  SELECT "playerId"
  FROM public.players
  WHERE "playerName" IN ('Terijo', 'Hyona')
);

DELETE FROM public.games g
WHERE NOT EXISTS (
  SELECT 1
  FROM public.participation
  WHERE "gameId" = g."gameId"
);

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
  'Hyona',
  '$2b$10$dashboard.seed.placeholder.hash'
WHERE NOT EXISTS (
  SELECT 1 FROM public.players WHERE "playerName" = 'Hyona' OR "mailAddress" = 'hyona@gmail.com'
);

-- 2) Define deterministic games for dashboard testing
WITH players_cte AS (
  SELECT
    MAX(CASE WHEN "playerName" = 'Terijo' THEN "playerId" END) AS terijo_id,
    MAX(CASE WHEN "playerName" = 'Hyona' THEN "playerId" END) AS hyona_id
  FROM public.players
  WHERE "playerName" IN ('Terijo', 'Hyona')
),
seed_rows AS (
  SELECT *
  FROM (
    VALUES
      ('2026-04-13 10:00:00'::timestamp, '2026-04-13 10:19:00'::timestamp, 'CLASSIC'::game_mode_enum, 'WIN'::game_result_enum,  'WHITE'::player_color_enum, true,  44, 21),
      ('2026-04-13 14:00:00'::timestamp, '2026-04-13 14:11:00'::timestamp, 'BLITZ'::game_mode_enum,   'WIN'::game_result_enum,  'BLACK'::player_color_enum, false, 30, 14),
      ('2026-04-13 19:30:00'::timestamp, '2026-04-13 20:55:00'::timestamp, 'CLASSIC'::game_mode_enum, 'WIN'::game_result_enum,  'WHITE'::player_color_enum, true,  52, 27),
      ('2026-04-14 09:45:00'::timestamp, '2026-04-14 10:10:00'::timestamp, 'BULLET'::game_mode_enum,  'DRAW'::game_result_enum, 'BLACK'::player_color_enum, NULL, 18, 9),
      ('2026-04-14 17:20:00'::timestamp, '2026-04-14 17:45:00'::timestamp, 'CLASSIC'::game_mode_enum, 'WIN'::game_result_enum,  'WHITE'::player_color_enum, true,  60, 28),
      ('2026-04-15 20:10:00'::timestamp, '2026-04-15 20:24:00'::timestamp, 'BLITZ'::game_mode_enum,   'WIN'::game_result_enum,  'BLACK'::player_color_enum, false, 33, 15),
      ('2026-04-16 12:00:00'::timestamp, '2026-04-16 12:09:00'::timestamp, 'BULLET'::game_mode_enum,  'WIN'::game_result_enum,  'WHITE'::player_color_enum, true,  16, 8),
      ('2026-04-16 21:05:00'::timestamp, '2026-04-16 21:19:00'::timestamp, 'BLITZ'::game_mode_enum,   'WIN'::game_result_enum,  'WHITE'::player_color_enum, false, 35, 17),
      ('2026-04-17 08:40:00'::timestamp, '2026-04-17 10:08:00'::timestamp, 'CLASSIC'::game_mode_enum, 'DRAW'::game_result_enum, 'BLACK'::player_color_enum, NULL, 40, 20),
      ('2026-04-17 18:00:00'::timestamp, '2026-04-17 18:15:00'::timestamp, 'BULLET'::game_mode_enum,  'WIN'::game_result_enum,  'BLACK'::player_color_enum, false, 20, 10),
      ('2026-04-18 11:00:00'::timestamp, '2026-04-18 11:13:00'::timestamp, 'CLASSIC'::game_mode_enum, 'WIN'::game_result_enum,  'BLACK'::player_color_enum, true,  48, 24),
      ('2026-04-18 16:30:00'::timestamp, '2026-04-18 16:41:00'::timestamp, 'BLITZ'::game_mode_enum,   'WIN'::game_result_enum,  'WHITE'::player_color_enum, false, 31, 13),
      ('2026-04-18 19:15:00'::timestamp, '2026-04-18 20:37:00'::timestamp, 'BULLET'::game_mode_enum,  'DRAW'::game_result_enum, 'BLACK'::player_color_enum, NULL, 18, 9),
      ('2026-04-19 09:05:00'::timestamp, '2026-04-19 09:18:00'::timestamp, 'CLASSIC'::game_mode_enum, 'WIN'::game_result_enum,  'WHITE'::player_color_enum, false, 55, 26),
      ('2026-04-19 14:50:00'::timestamp, '2026-04-19 16:18:00'::timestamp, 'BLITZ'::game_mode_enum,   'WIN'::game_result_enum,  'BLACK'::player_color_enum, true,  29, 14),
      ('2026-04-19 18:40:00'::timestamp, '2026-04-19 18:53:00'::timestamp, 'BULLET'::game_mode_enum,  'WIN'::game_result_enum,  'WHITE'::player_color_enum, false, 21, 10),
      ('2026-04-19 19:20:00'::timestamp, '2026-04-19 19:33:00'::timestamp, 'CLASSIC'::game_mode_enum, 'WIN'::game_result_enum,  'BLACK'::player_color_enum, true,  50, 25),
      ('2026-04-19 20:00:00'::timestamp, '2026-04-19 20:22:00'::timestamp, 'BLITZ'::game_mode_enum,   'DRAW'::game_result_enum, 'WHITE'::player_color_enum, NULL, 27, 12)
  ) AS t(
    created_at,
    completed_at,
    game_mode,
    game_result,
    terijo_color,
    terijo_wins,
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
  SELECT
    g."gameId",
    s.terijo_color,
    CASE
      WHEN s.game_result = 'DRAW'::game_result_enum THEN 'DRAW'::player_result_enum
      WHEN s.terijo_wins THEN 'WIN'::player_result_enum
      ELSE 'LOSE'::player_result_enum
    END AS terijo_result,
    CASE
      WHEN s.game_result = 'DRAW'::game_result_enum THEN 'DRAW'::player_result_enum
      WHEN s.terijo_wins THEN 'LOSE'::player_result_enum
      ELSE 'WIN'::player_result_enum
    END AS hyona_result
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
    MAX(CASE WHEN "playerName" = 'Hyona' THEN "playerId" END) AS hyona_id
  FROM public.players
  WHERE "playerName" IN ('Terijo', 'Hyona')
),
seed_rows AS (
  SELECT *
  FROM (
    VALUES
      ('2026-04-13 10:00:00'::timestamp, '2026-04-13 10:19:00'::timestamp, 'CLASSIC'::game_mode_enum, 'WIN'::game_result_enum,  'WHITE'::player_color_enum, true,  44, 21),
      ('2026-04-13 14:00:00'::timestamp, '2026-04-13 14:11:00'::timestamp, 'BLITZ'::game_mode_enum,   'WIN'::game_result_enum,  'BLACK'::player_color_enum, false, 30, 14),
      ('2026-04-13 19:30:00'::timestamp, '2026-04-13 20:55:00'::timestamp, 'CLASSIC'::game_mode_enum, 'WIN'::game_result_enum,  'WHITE'::player_color_enum, true,  52, 27),
      ('2026-04-14 09:45:00'::timestamp, '2026-04-14 10:10:00'::timestamp, 'BULLET'::game_mode_enum,  'DRAW'::game_result_enum, 'BLACK'::player_color_enum, NULL, 18, 9),
      ('2026-04-14 17:20:00'::timestamp, '2026-04-14 17:45:00'::timestamp, 'CLASSIC'::game_mode_enum, 'WIN'::game_result_enum,  'WHITE'::player_color_enum, true,  60, 28),
      ('2026-04-15 20:10:00'::timestamp, '2026-04-15 20:24:00'::timestamp, 'BLITZ'::game_mode_enum,   'WIN'::game_result_enum,  'BLACK'::player_color_enum, false, 33, 15),
      ('2026-04-16 12:00:00'::timestamp, '2026-04-16 12:09:00'::timestamp, 'BULLET'::game_mode_enum,  'WIN'::game_result_enum,  'WHITE'::player_color_enum, true,  16, 8),
      ('2026-04-16 21:05:00'::timestamp, '2026-04-16 21:19:00'::timestamp, 'BLITZ'::game_mode_enum,   'WIN'::game_result_enum,  'WHITE'::player_color_enum, false, 35, 17),
      ('2026-04-17 08:40:00'::timestamp, '2026-04-17 10:08:00'::timestamp, 'CLASSIC'::game_mode_enum, 'DRAW'::game_result_enum, 'BLACK'::player_color_enum, NULL, 40, 20),
      ('2026-04-17 18:00:00'::timestamp, '2026-04-17 18:15:00'::timestamp, 'BULLET'::game_mode_enum,  'WIN'::game_result_enum,  'BLACK'::player_color_enum, false, 20, 10),
      ('2026-04-18 11:00:00'::timestamp, '2026-04-18 11:13:00'::timestamp, 'CLASSIC'::game_mode_enum, 'WIN'::game_result_enum,  'BLACK'::player_color_enum, true,  48, 24),
      ('2026-04-18 16:30:00'::timestamp, '2026-04-18 16:41:00'::timestamp, 'BLITZ'::game_mode_enum,   'WIN'::game_result_enum,  'WHITE'::player_color_enum, false, 31, 13),
      ('2026-04-18 19:15:00'::timestamp, '2026-04-18 20:37:00'::timestamp, 'BULLET'::game_mode_enum,  'DRAW'::game_result_enum, 'BLACK'::player_color_enum, NULL, 18, 9),
      ('2026-04-19 09:05:00'::timestamp, '2026-04-19 09:18:00'::timestamp, 'CLASSIC'::game_mode_enum, 'WIN'::game_result_enum,  'WHITE'::player_color_enum, false, 55, 26),
      ('2026-04-19 14:50:00'::timestamp, '2026-04-19 16:18:00'::timestamp, 'BLITZ'::game_mode_enum,   'WIN'::game_result_enum,  'BLACK'::player_color_enum, true,  29, 14),
      ('2026-04-19 18:40:00'::timestamp, '2026-04-19 18:53:00'::timestamp, 'BULLET'::game_mode_enum,  'WIN'::game_result_enum,  'WHITE'::player_color_enum, false, 21, 10),
      ('2026-04-19 19:20:00'::timestamp, '2026-04-19 19:33:00'::timestamp, 'CLASSIC'::game_mode_enum, 'WIN'::game_result_enum,  'BLACK'::player_color_enum, true,  50, 25),
      ('2026-04-19 20:00:00'::timestamp, '2026-04-19 20:22:00'::timestamp, 'BLITZ'::game_mode_enum,   'DRAW'::game_result_enum, 'WHITE'::player_color_enum, NULL, 27, 12)
  ) AS t(
    created_at,
    completed_at,
    game_mode,
    game_result,
    terijo_color,
    terijo_wins,
    total_moves,
    winner_moves
  )
),
all_target_games AS (
  SELECT
    g."gameId",
    s.terijo_color,
    CASE
      WHEN s.game_result = 'DRAW'::game_result_enum THEN 'DRAW'::player_result_enum
      WHEN s.terijo_wins THEN 'WIN'::player_result_enum
      ELSE 'LOSE'::player_result_enum
    END AS terijo_result,
    CASE
      WHEN s.game_result = 'DRAW'::game_result_enum THEN 'DRAW'::player_result_enum
      WHEN s.terijo_wins THEN 'LOSE'::player_result_enum
      ELSE 'WIN'::player_result_enum
    END AS hyona_result
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