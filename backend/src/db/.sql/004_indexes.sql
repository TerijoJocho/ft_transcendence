CREATE UNIQUE INDEX one_current_game_per_player
ON participation (player_id)
WHERE player_result = 'PENDING';