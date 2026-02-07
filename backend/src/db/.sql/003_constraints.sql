
ALTER TABLE player 
	ADD CONSTRAINT unq_session_id UNIQUE (session_id),
	ADD CONSTRAINT nn_session_id CHECK (session_id IS NOT NULL),
	ADD CONSTRAINT unq_mail_address UNIQUE (mail_address),
	ADD CONSTRAINT nn_mail_address CHECK (mail_address IS NOT NULL),
	ADD CONSTRAINT unq_game_name UNIQUE (game_name),
	ADD CONSTRAINT nn_game_name CHECK (game_name IS NOT NULL),
	ADD CONSTRAINT nn_pwd CHECK (pwd IS NOT NULL),
	ADD CONSTRAINT nn_avatar_url CHECK (avatar_url IS NOT NULL);

ALTER TABLE game
	ADD CONSTRAINT nn_game_date CHECK (game_date IS NOT NULL),
	ADD CONSTRAINT nn_game_status CHECK (game_status IS NOT NULL),
	ADD CONSTRAINT nn_game_result CHECK (game_result IS NOT NULL),
	ADD CONSTRAINT nn_game_mode CHECK (game_mode IS NOT NULL), 
	ADD CONSTRAINT game_finished_with_moves 
	CHECK (
		(game_status <> 'FINISHED') OR (total_nb_moves IS NOT NULL AND winner_nb_moves IS NOT NULL)
    );

ALTER TABLE participation
	ADD CONSTRAINT nn_player_id CHECK (player_id IS NOT NULL),
	ADD CONSTRAINT fk_participation_player
    	FOREIGN KEY (player_id)
        	REFERENCES player(player_id)
       		ON DELETE RESTRICT, -- deleting a player in player table doesn't remove participation history
	ADD CONSTRAINT nn_game_id CHECK (game_id IS NOT NULL),
	ADD CONSTRAINT fk_participation_game
        FOREIGN KEY (game_id)
            REFERENCES game(game_id)
            ON DELETE CASCADE -- deleting a game in game table removes all associated participations
	ADD CONSTRAINT nn_player_result CHECK (player_result IS NOT NULL),
	ADD CONSTRAINT nn_player_color CHECK (player_color IS NOT NULL),
    ADD CONSTRAINT unique_player_game
        UNIQUE (player_id, game_id),
    ADD CONSTRAINT unique_color_per_game
        UNIQUE (game_id, player_color);

ALTER TABLE friendship
	ADD CONSTRAINT nn_player1_id CHECK (player1_id IS NOT NULL),
	ADD CONSTRAINT fk_friendship_player1
		FOREIGN KEY (player1_id)
			REFERENCES player(player_id)
				ON DELETE RESTRICT,
	ADD CONSTRAINT nn_player2_id CHECK (player2_id IS NOT NULL),
	ADD CONSTRAINT fk_friendship_player2
		FOREIGN KEY (player2_id)
			REFERENCES player(player_id)
				ON DELETE RESTRICT,
	ADD CONSTRAINT nn_friendship_status CHECK (friendship_status IS NOT NULL),
	ADD CONSTRAINT unique_friend_pair UNIQUE (player1_id, player2_id),
	ADD CONSTRAINT no_self_friendship CHECK (player1_id <> player2_id),
	ADD CONSTRAINT order_pair CHECK (player1_id < player2_id);