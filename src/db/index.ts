import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { envs } from "../config/envs.ts";
import * as expensesSchema from "./schema/expenses.ts";
import * as usersSchema from "./schema/users.ts";

const schema = { ...usersSchema, ...expensesSchema };

const client = postgres(envs.db.url);

export const db = drizzle(client, { schema });
export type Schema = typeof schema;
