import { compareSync } from "bcrypt-ts";
import { AccountRepository } from "../account_repository.ts";

export class LoginAccountUseCase {
  constructor(private repository: AccountRepository) {}

  async execute(email: string, password: string): Promise<boolean> {
    const user = await this.repository.getByEmail(email);

    if (user == null) {
      throw new Error("Account Not Found!");
    }
    console.log(password);
    console.log(user);

    return compareSync(password, user.password);
  }
}
