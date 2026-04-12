ALTER TABLE "friendship" ADD COLUMN "requesterId" integer;--> statement-breakpoint
UPDATE "friendship" SET "requesterId" = "player1Id" WHERE "requesterId" IS NULL;--> statement-breakpoint
ALTER TABLE "friendship" ALTER COLUMN "requesterId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_requesterId_players_playerId_fk" FOREIGN KEY ("requesterId") REFERENCES "public"."players"("playerId") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "friendship" ADD CONSTRAINT "requester_in_friendship" CHECK ("friendship"."requesterId" = "friendship"."player1Id" OR "friendship"."requesterId" = "friendship"."player2Id");