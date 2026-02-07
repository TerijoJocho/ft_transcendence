--query to insert new player
INSERT INTO player (session_id, mail_address, game_name, pwd) VALUES (
	'testSI',
	'test@test.com',
	'testGN',
	'testPWD'
);

-- query to find player
SELECT * 
FROM player 
WHERE player_id = 1;
---
SELECT * 
FROM player 
WHERE mail_address = 'test@test.com';

-- query to update profile
UPDATE player 
SET game_name = 'testProMax' 
WHERE game_name = 'testGN';

-- query to delete a player
DELETE FROM player 
WHERE game_name = 'testGN';

-- query to add a game and retrieve game_id (new_game is temp table with only game_id attr.)
WITH new_game AS (
	INSERT INTO game (game_mode) VALUES ('CLASSIC')
	RETURNING game_id
)

-- query to retrieve all games;
SELECT * FROM game;

-- query to retrieve all ongoing games
SELECT * 
FROM game 
WHERE game_status = 'ONGOING';

-- query to retrieve all games from one player
SELECT * 
FROM game
JOIN participation ON game.game_id = participation.game_id
WHERE player_id = 1;

-- query to update game status
UPDATE game 
SET game_status = 'FINISHED'
WHERE game_id = 42;

-- query to update total nb moves
UPDATE game 
SET total_nb_moves = 84 
WHERE game_id = 42;

-- query to update game global result
UPDATE game 
SET game_result = 'WIN' 
WHERE game_id = 42;

-- query to delete game
DELETE FROM game 
WHERE game_id = 1 
AND game_status IN ('PENDING', 'ONGOING');

-- query to add a participation
INSERT INTO participation (player_id, game_id, player_result, player_color) 
VALUES (1, 42,'PENDING', 'WHITE');

-- query to add a participation (from player's game_name)
INSERT INTO participation (player_id, game_id, player_result, player_color)
SELECT player_id, 42, 'PENDING', 'BLACK'
FROM player
WHERE game_name = 'testGN';

-- query to update player individual result
UPDATE participation
SET player_result = 'WIN'
WHERE player_id = 1
  AND game_id = 42;
  
-- query to select both players of one game
SELECT *
FROM participation
WHERE game_id = 42;

-- query to check existence of a player already in a game
SELECT 1
FROM participation
WHERE player_id = 1 AND player_result = 'PENDING'

-- query to delete a participation
DELETE FROM participation
WHERE game_id = 42;

--query to create new friendship row and retrieve its friendship_id
WITH new_friendship AS (
INSERT INTO friendship (player1_id, player2_id) VALUES (
	1,
	2)
RETURNING friendship_id
)

-- query to find all player friendships
SELECT player2_id
FROM friendship
WHERE player1_id = 1
UNION
SELECT player1_id
FROM friendship
WHERE player2_id = 1;

-- query to update friendship status
UPDATE friendship 
SET friendship_status = 'ADDED' 
WHERE friendship_id = 42;
-- WHERE player1_id = 1 AND player2_id = 2;

-- quere to check if two players are friends
SELECT 1
FROM friendship
WHERE player1_id = 1 AND player2_id = 2;

-- query to delete a friendship
DELETE FROM friendship 
WHERE friendship_id = 42;
-- WHERE player1_id = 1 AND player2_id = 2;

-- query to calculate each player's winrate
SELECT player_id,
(( COUNT(*) FILTER (WHERE player_result = 'WIN') + 0.5 * COUNT(*) FILTER (WHERE player_result = 'DRAW'))
/ NULLIF(COUNT(*) FILTER (WHERE player_result <> 'PENDING'), 0)::float
) AS win_rate 
FROM participation
-- WHERE player_id = 1 (to have a single player winrate)
GROUP BY player_id;

-- query to calculate average number of moves to win for each player
SELECT player_id,
( AVG(winner_nb_moves)
) AS avg_win_moves
FROM participation
JOIN  game ON game_id
WHERE game_result
GROUP BY player_id;

--query to find each player's favourite game mode
SELECT player_id, game_mode
FROM (
    SELECT
        player_id,
        game_mode,
        COUNT(*) AS nb_games,
        RANK() OVER (
            PARTITION BY player_id
            ORDER BY COUNT(*) DESC
        ) AS ranking
    FROM participation
    JOIN game ON game.game_id = participation.game_id
    GROUP BY player_id, game_mode
) tmp
WHERE ranking = 1;