ALTER TABLE "friendship" ADD COLUMN "isFriend" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "friendship" ADD COLUMN "isBlocked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "friendship" ADD COLUMN "isFavFriend" boolean DEFAULT false NOT NULL;