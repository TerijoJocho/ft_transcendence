ALTER TABLE "players" ADD COLUMN "twoFactorSecretCiphertext" varchar DEFAULT null;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "twoFactorFailedAttempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "twoFactorEnabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "twoFactorLockUntil" timestamp DEFAULT null;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_twoFactorSecretCiphertext_unique" UNIQUE("twoFactorSecretCiphertext");