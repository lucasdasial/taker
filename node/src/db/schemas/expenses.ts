import {
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users.ts";

export const categoryEnum = pgEnum("category", [
  "casa",
  "comerFora",
  "mercado",
  "transporte",
  "saude",
  "educacao",
  "lazer",
  "assinaturas",
  "dividas",
  "compras",
  "naoCategorizado",
]);

export const expensesTable = pgTable(
  "expenses",
  {
    id: uuid().primaryKey().defaultRandom().notNull(),
    amount: integer().notNull(),
    name: varchar({ length: 255 }).notNull(),
    category: categoryEnum().notNull(),
    ownerId: uuid()
      .references(() => usersTable.id)
      .notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("expenses_owner_idx").on(table.ownerId),

    index("expenses_owner_created_idx").on(table.ownerId, table.createdAt),

    index("expenses_owner_category_idx").on(table.ownerId, table.category),
  ],
);

type insertType = typeof expensesTable.$inferInsert;
export type Expense = typeof expensesTable.$inferSelect;
export type ExpenseCreateDto = Omit<insertType, "id" | "createdAt">;
export type ExpenseUpdateDto = Omit<ExpenseCreateDto, "ownerId">;
