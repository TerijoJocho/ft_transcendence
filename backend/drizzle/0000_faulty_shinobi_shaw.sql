CREATE TYPE "public"."friendship_status_enum" AS ENUM('PENDING', 'ADDED');--> statement-breakpoint
CREATE TYPE "public"."game_mode_enum" AS ENUM('CLASSIC', 'BLITZ', 'BULLET');--> statement-breakpoint
CREATE TYPE "public"."game_result_enum" AS ENUM('WIN', 'DRAW', 'PENDING');--> statement-breakpoint
CREATE TYPE "public"."game_status_enum" AS ENUM('PENDING', 'ONGOING', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."player_color_enum" AS ENUM('WHITE', 'BLACK');--> statement-breakpoint
CREATE TYPE "public"."player_result_enum" AS ENUM('PENDING', 'WIN', 'LOSE', 'DRAW');--> statement-breakpoint
CREATE TABLE "friendship" (
	"friendshipId" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "friendship_friendshipId_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"player1Id" integer,
	"player2Id" integer,
	"friendshipStatus" "friendship_status_enum" DEFAULT 'PENDING' NOT NULL,
	CONSTRAINT "friendship_player1Id_player2Id_unique" UNIQUE("player1Id","player2Id"),
	CONSTRAINT "no_self_friendship" CHECK ("friendship"."player1Id" <> "friendship"."player2Id"),
	CONSTRAINT "ordered_player_ids" CHECK ("friendship"."player1Id" < "friendship"."player2Id")
);
--> statement-breakpoint
CREATE TABLE "games" (
	"gameId" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "games_gameId_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"totalNbMoves" integer,
	"winnerNbMoves" integer,
	"gameDate" timestamp DEFAULT now() NOT NULL,
	"gameStatus" "game_status_enum" DEFAULT 'PENDING' NOT NULL,
	"gameResult" "game_result_enum" DEFAULT 'PENDING' NOT NULL,
	"gameMode" "game_mode_enum" NOT NULL,
	CONSTRAINT "checkmate" CHECK ("games"."gameStatus" <> 'COMPLETED' OR ("games"."totalNbMoves" IS NOT NULL AND "games"."winnerNbMoves" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "participation" (
	"participationId" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "participation_participationId_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"playerId" integer NOT NULL,
	"gameId" integer NOT NULL,
	"playerResult" "player_result_enum" DEFAULT 'PENDING' NOT NULL,
	"playerColor" "player_color_enum" NOT NULL,
	CONSTRAINT "participation_playerId_gameId_unique" UNIQUE("playerId","gameId"),
	CONSTRAINT "participation_gameId_playerColor_unique" UNIQUE("gameId","playerColor")
);
--> statement-breakpoint
CREATE TABLE "players" (
	"playerId" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "players_playerId_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sessionId" varchar NOT NULL,
	"mailAddress" varchar NOT NULL,
	"gameName" varchar NOT NULL,
	"pwd" varchar NOT NULL,
	"avatarUrl" varchar DEFAULT 'https://test.com' NOT NULL,
	CONSTRAINT "players_sessionId_unique" UNIQUE("sessionId"),
	CONSTRAINT "players_mailAddress_unique" UNIQUE("mailAddress"),
	CONSTRAINT "players_gameName_unique" UNIQUE("gameName")
);
--> statement-breakpoint
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_player1Id_players_playerId_fk" FOREIGN KEY ("player1Id") REFERENCES "public"."players"("playerId") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_player2Id_players_playerId_fk" FOREIGN KEY ("player2Id") REFERENCES "public"."players"("playerId") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "participation" ADD CONSTRAINT "participation_playerId_players_playerId_fk" FOREIGN KEY ("playerId") REFERENCES "public"."players"("playerId") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "participation" ADD CONSTRAINT "participation_gameId_games_gameId_fk" FOREIGN KEY ("gameId") REFERENCES "public"."games"("gameId") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "one_current_game_only" ON "participation" USING btree ("playerId") WHERE "participation"."playerResult" = 'PENDING';