ALTER TABLE "games" ALTER COLUMN "gameCompletedAt" SET DEFAULT null;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "gameStartedAt" timestamp DEFAULT null;--> statement-breakpoint

UPDATE "games"
SET "gameStartedAt" = COALESCE("gameCreatedAt", "gameCompletedAt", NOW())
WHERE "gameStatus" <> 'PENDING' AND "gameStartedAt" IS NULL;

UPDATE "games"
SET "gameCompletedAt" = "gameStartedAt"
WHERE "gameStatus" = 'COMPLETED' AND "gameCompletedAt" IS NULL;

ALTER TABLE "games" ADD CONSTRAINT "game_started_not_null_if_ongoing_or_completed" CHECK ("games"."gameStatus" = 'PENDING' OR "games"."gameStartedAt" IS NOT NULL);--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "game_completed_not_null_if_completed" CHECK ("games"."gameStatus" <> 'COMPLETED' OR "games"."gameCompletedAt" IS NOT NULL);--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "winner_moves_less_than_total_moves" CHECK ("games"."winnerNbMoves" <= "games"."totalNbMoves");