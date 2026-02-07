CREATE DATABASE IF NOT EXISTS ChessWarDB;

CREATE TYPE game_status_enum AS ENUM ('PENDING', 'ONGOING', 'COMPLETED');
CREATE TYPE game_result_enum AS ENUM ('WIN', 'DRAW', 'PENDING');
CREATE TYPE game_mode_enum AS ENUM ('CLASSIC', 'BLITZ', 'BULLET');
CREATE TYPE player_result_enum AS ENUM ('PENDING', 'WIN', 'LOSE', 'DRAW');
CREATE TYPE player_color_enum AS ENUM ('WHITE', 'BLACK');
CREATE TYPE friendship_status_enum AS ENUM ('PENDING', 'ADDED');