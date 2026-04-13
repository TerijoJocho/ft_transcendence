ALTER TABLE "players" ALTER COLUMN "pwd" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "isGoogleUser" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "pwd_required_for_non_google_users" CHECK ("players"."isGoogleUser" = true OR "players"."pwd" IS NOT NULL);