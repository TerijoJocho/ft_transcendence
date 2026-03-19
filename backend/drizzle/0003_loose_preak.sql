CREATE TABLE "messages" (
	"messageId" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "messages_messageId_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"senderId" integer NOT NULL,
	"receiverId" integer NOT NULL,
	"content" varchar(1000) NOT NULL,
	"sentAt" timestamp DEFAULT now() NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_players_playerId_fk" FOREIGN KEY ("senderId") REFERENCES "public"."players"("playerId") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverId_players_playerId_fk" FOREIGN KEY ("receiverId") REFERENCES "public"."players"("playerId") ON DELETE cascade ON UPDATE cascade;