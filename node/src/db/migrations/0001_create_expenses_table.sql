CREATE TYPE "public"."category" AS ENUM('casa', 'comerFora', 'mercado', 'transporte', 'saude', 'educacao', 'lazer', 'assinaturas', 'dividas', 'compras', 'naoCategorizado');--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"amount" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" "category" NOT NULL,
	"ownerId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_ownerId_users_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "expenses_owner_idx" ON "expenses" USING btree ("ownerId");--> statement-breakpoint
CREATE INDEX "expenses_owner_created_idx" ON "expenses" USING btree ("ownerId","createdAt");--> statement-breakpoint
CREATE INDEX "expenses_owner_category_idx" ON "expenses" USING btree ("ownerId","category");