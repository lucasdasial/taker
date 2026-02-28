import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "../../db/schema/users.ts";
import { type NewUser, users } from "../../db/schema/users.ts";

type Db = PostgresJsDatabase<typeof schema>;

export class UsersRepository {
	constructor(private readonly db: Db) {}

	findByEmail(email: string) {
		return this.db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1)
			.then((r) => r[0] ?? null);
	}

	findById(id: string) {
		return this.db
			.select()
			.from(users)
			.where(eq(users.id, id))
			.limit(1)
			.then((r) => r[0] ?? null);
	}

	create(data: NewUser) {
		return this.db
			.insert(users)
			.values(data)
			.returning()
			.then((r) => r[0]);
	}
}
