import bcrypt from "bcryptjs";
import { signToken } from "../../config/jwt.ts";
import { AppError } from "../../web/errors/AppError.ts";
import type { UsersRepository } from "./users.repository.ts";

const SALT_ROUNDS = 10;

export class UsersService {
	constructor(private readonly usersRepository: UsersRepository) {}

	async register(data: { name: string; email: string; password: string }) {
		const existing = await this.usersRepository.findByEmail(data.email);
		if (existing) {
			throw new AppError(409, "Email already in use");
		}

		const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
		const user = await this.usersRepository.create({
			...data,
			password: hashedPassword,
		});

		const { password: _, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	async login(data: { email: string; password: string }) {
		const user = await this.usersRepository.findByEmail(data.email);
		if (!user) {
			throw new AppError(401, "Invalid credentials");
		}

		const passwordMatch = await bcrypt.compare(data.password, user.password);
		if (!passwordMatch) {
			throw new AppError(401, "Invalid credentials");
		}

		const token = signToken({ sub: user.id });
		return { token };
	}
}
