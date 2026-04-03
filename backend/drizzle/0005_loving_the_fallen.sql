ALTER TABLE "games" RENAME COLUMN "gameDate" TO "gameCreatedAt";--> statement-breakpoint
ALTER TABLE "players" RENAME COLUMN "gameName" TO "playerName";--> statement-breakpoint
ALTER TABLE "players" DROP CONSTRAINT "players_gameName_unique";--> statement-breakpoint
ALTER TABLE "friendship" ALTER COLUMN "isFriend" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "gameCompletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "playerCreatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_playerName_unique" UNIQUE("playerName");