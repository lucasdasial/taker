export class AccountEmailAlreadyUsedError extends Error {
  constructor() {
    super("Email already used!");
  }
}
