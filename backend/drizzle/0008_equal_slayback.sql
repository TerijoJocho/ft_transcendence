ALTER TABLE "players" ALTER COLUMN "pwd" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "isGoogleUser" boolean;--> statement-breakpoint
UPDATE "players"
SET "isGoogleUser" = ("pwd" IS NULL);--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "isGoogleUser" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "isGoogleUser" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "pwd_required_for_non_google_users" CHECK ("players"."isGoogleUser" = true OR "players"."pwd" IS NOT NULL);