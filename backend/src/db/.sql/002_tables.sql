--query to create player table
CREATE TABLE IF NOT EXISTS player (
	player_id SERIAL PRIMARY KEY,
	session_id VARCHAR,
	mail_address VARCHAR,
	game_name VARCHAR,
	pwd VARCHAR,
	avatar_url VARCHAR DEFAULT 
		'https://test.com'
);

--query to create game table
CREATE TABLE IF NOT EXISTS game (
	game_id SERIAL PRIMARY KEY,
	total_nb_moves INT DEFAULT NULL,
	winner_nb_moves INT DEFAULT NULL,
	game_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	game_status game_status_enum DEFAULT 'PENDING',
	game_result game_result_enum DEFAULT 'PENDING',
	game_mode game_mode_enum
);

--query to create participation table
CREATE TABLE IF NOT EXISTS participation (
	participation_id SERIAL PRIMARY KEY,
    player_id INT,
    game_id INT,
    player_result player_result_enum DEFAULT 'PENDING',
    player_color player_color_enum,
);

--query to create friendship table
CREATE TABLE IF NOT EXISTS friendship (
	friendship_id SERIAL PRIMARY KEY,
	player1_id INT,
	player2_id INT,
	friendship_status friendship_status_enum DEFAULT 'PENDING'
);