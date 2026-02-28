CREATE TYPE "public"."expense_category" AS ENUM('MERCADO', 'RESTAURANTES', 'PRODUTOS_LIMPEZA', 'SAUDE', 'MORADIA', 'ASSINATURAS', 'TRANSPORTE', 'EDUCACAO', 'COMPRAS', 'DIVIDAS', 'LAZER', 'BELEZA');--> statement-breakpoint
CREATE TYPE "public"."expense_direction" AS ENUM('IN', 'OUT');--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" varchar(255) NOT NULL,
	"category" "expense_category" NOT NULL,
	"direction" "expense_direction" DEFAULT 'OUT' NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;