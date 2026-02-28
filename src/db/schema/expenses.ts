import {
	numeric,
	pgEnum,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users.ts";

export const categoryEnum = pgEnum("expense_category", [
	"MERCADO",
	"RESTAURANTES",
	"PRODUTOS_LIMPEZA",
	"SAUDE",
	"MORADIA",
	"ASSINATURAS",
	"TRANSPORTE",
	"EDUCACAO",
	"COMPRAS",
	"DIVIDAS",
	"LAZER",
	"BELEZA",
]);

export const directionEnum = pgEnum("expense_direction", ["IN", "OUT"]);

export const expenses = pgTable("expenses", {
	id: uuid("id").primaryKey().defaultRandom(),
	description: varchar("description", { length: 255 }).notNull(),
	category: categoryEnum("category").notNull(),
	direction: directionEnum("direction").notNull().default("OUT"),
	value: numeric("value", { precision: 10, scale: 2 }).notNull(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
