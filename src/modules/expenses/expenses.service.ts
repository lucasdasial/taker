import type { NewExpense } from "../../db/schema/expenses.ts";
import { ResourceNotFoundError } from "../../web/errors/ResourceNotFoundError.ts";
import type { ExpensesRepository } from "./expenses.repository.ts";

type CreateInput = Pick<NewExpense, "description" | "category" | "value"> & {
	direction?: NewExpense["direction"];
};

type UpdateInput = Partial<
	Pick<NewExpense, "description" | "category" | "direction" | "value">
>;

export class ExpensesService {
	constructor(private readonly expensesRepository: ExpensesRepository) {}

	list(userId: string) {
		return this.expensesRepository.findAll(userId);
	}

	create(userId: string, data: CreateInput) {
		return this.expensesRepository.create({ ...data, userId });
	}

	async update(id: string, userId: string, data: UpdateInput) {
		const expense = await this.expensesRepository.update(id, userId, data);
		if (!expense) throw new ResourceNotFoundError("Expense");
		return expense;
	}

	async remove(id: string, userId: string) {
		const expense = await this.expensesRepository.remove(id, userId);
		if (!expense) throw new ResourceNotFoundError("Expense");
	}
}
