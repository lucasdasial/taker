import { genSaltSync, hashSync } from "bcrypt-ts";
import { User, UserCreateDto } from "../../../db/schemas/users.ts";
import { AccountEmailAlreadyUsedError } from "../account_erros.ts";
import { AccountRepository } from "../account_repository.ts";

export class CreateAccountUseCase {
  constructor(private repository: AccountRepository) {}

  async execute(data: UserCreateDto): Promise<User> {
    const findUser = await this.repository.getByEmail(data.email);

    if (findUser != null && findUser.email === data.email) {
      throw new AccountEmailAlreadyUsedError();
    }

    const salt = genSaltSync(10);
    const hash = hashSync(data.password, salt);

    data.password = hash;

    return await this.repository.save(data);
  }
}
