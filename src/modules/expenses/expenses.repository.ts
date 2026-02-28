import { and, desc, eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "../../db/schema/expenses.ts";
import { expenses, type NewExpense } from "../../db/schema/expenses.ts";

type Db = PostgresJsDatabase<typeof schema>;

type UpdateData = Partial<
	Pick<NewExpense, "description" | "category" | "direction" | "value">
>;

export class ExpensesRepository {
	constructor(private readonly db: Db) {}

	findAll(userId: string) {
		return this.db
			.select()
			.from(expenses)
			.where(eq(expenses.userId, userId))
			.orderBy(desc(expenses.createdAt));
	}

	findById(id: string, userId: string) {
		return this.db
			.select()
			.from(expenses)
			.where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
			.limit(1)
			.then((r) => r[0] ?? null);
	}

	create(data: NewExpense) {
		return this.db
			.insert(expenses)
			.values(data)
			.returning()
			.then((r) => r[0]);
	}

	update(id: string, userId: string, data: UpdateData) {
		return this.db
			.update(expenses)
			.set({ ...data, updatedAt: new Date() })
			.where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
			.returning()
			.then((r) => r[0] ?? null);
	}

	remove(id: string, userId: string) {
		return this.db
			.delete(expenses)
			.where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
			.returning()
			.then((r) => r[0] ?? null);
	}
}
