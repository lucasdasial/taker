import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { User, UserCreateDto, usersTable } from "../../db/schemas/users.ts";

export class AccountRepository {
  constructor(private db: NodePgDatabase) {}

  async getByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    return result[0] ?? null;
  }

  async save(data: UserCreateDto): Promise<User> {
    await this.db.insert(usersTable).values(data);

    return (await this.getByEmail(data.email)) as User;
  }
}
