ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "twoFactorSecretCiphertext" varchar DEFAULT null;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "twoFactorEnabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'players_twoFactorSecretCiphertext_unique'
	) THEN
		ALTER TABLE "players" ADD CONSTRAINT "players_twoFactorSecretCiphertext_unique" UNIQUE("twoFactorSecretCiphertext");
	END IF;
END $$;--> statement-breakpoint

ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "isGoogleUser" boolean;--> statement-breakpoint
UPDATE "players"
SET "isGoogleUser" = ("pwd" IS NULL)
WHERE "isGoogleUser" IS NULL;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "isGoogleUser" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "isGoogleUser" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "players" DROP COLUMN IF EXISTS "twoFactorFailedAttempts";--> statement-breakpoint
ALTER TABLE "players" DROP COLUMN IF EXISTS "twoFactorLockUntil";--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'pwd_required_for_non_google_users'
	) THEN
		ALTER TABLE "players" ADD CONSTRAINT "pwd_required_for_non_google_users" CHECK ("players"."isGoogleUser" = true OR "players"."pwd" IS NOT NULL);
	END IF;
END $$;