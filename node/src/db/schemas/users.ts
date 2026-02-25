import {
  boolean,
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable(
  "users",
  {
    id: uuid().primaryKey().defaultRandom().notNull(),
    username: varchar({ length: 255 }).notNull(),
    password: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    isActive: boolean().default(true),
  },
  (table) => [index("idx_user_email").on(table.email)],
);

type insertType = typeof usersTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;
export type UserCreateDto = Omit<insertType, "id" | "createdAt" | "isActive">;
export type UserUpdateDto = Omit<insertType, "id" | "createdAt">;
