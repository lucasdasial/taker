import { describe, expect, it, vi } from "vitest";
import { ExpensesRepository } from "./expenses.repository.ts";

vi.mock("drizzle-orm", () => ({
	eq: vi.fn(() => "eq-condition"),
	and: vi.fn(() => "and-condition"),
	desc: vi.fn(() => "desc-condition"),
}));

function makeMockDb(rows: unknown[] = []) {
	const selectChain = {
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		orderBy: vi.fn().mockResolvedValue(rows),
		limit: vi.fn().mockResolvedValue(rows),
	};
	return {
		select: vi.fn(() => selectChain),
		insert: vi.fn(() => ({
			values: vi.fn().mockReturnThis(),
			returning: vi.fn().mockResolvedValue(rows),
		})),
		update: vi.fn(() => ({
			set: vi.fn().mockReturnThis(),
			where: vi.fn(() => ({
				returning: vi.fn().mockResolvedValue(rows),
			})),
		})),
		delete: vi.fn(() => ({
			where: vi.fn(() => ({
				returning: vi.fn().mockResolvedValue(rows),
			})),
		})),
		_selectChain: selectChain,
	};
}

const baseExpense = {
	id: "expense-123",
	description: "Compras do mês",
	category: "MERCADO" as const,
	direction: "OUT" as const,
	value: "150.00",
	userId: "user-123",
	createdAt: new Date(),
	updatedAt: new Date(),
};

describe("ExpensesRepository", () => {
	describe("findAll", () => {
		it("should return expenses for user ordered by createdAt desc", async () => {
			const db = makeMockDb([baseExpense]);
			const repo = new ExpensesRepository(db as never);

			const result = await repo.findAll("user-123");

			expect(result).toEqual([baseExpense]);
			expect(db.select).toHaveBeenCalled();
		});

		it("should return empty array when user has no expenses", async () => {
			const db = makeMockDb([]);
			const repo = new ExpensesRepository(db as never);

			const result = await repo.findAll("user-123");

			expect(result).toEqual([]);
		});
	});

	describe("findById", () => {
		it("should return expense when found", async () => {
			const db = makeMockDb([baseExpense]);
			const repo = new ExpensesRepository(db as never);

			const result = await repo.findById("expense-123", "user-123");

			expect(result).toEqual(baseExpense);
		});

		it("should return null when not found", async () => {
			const db = makeMockDb([]);
			const repo = new ExpensesRepository(db as never);

			const result = await repo.findById("nonexistent", "user-123");

			expect(result).toBeNull();
		});
	});

	describe("create", () => {
		it("should insert and return the created expense", async () => {
			const db = makeMockDb([baseExpense]);
			const repo = new ExpensesRepository(db as never);

			const result = await repo.create({
				description: "Compras do mês",
				category: "MERCADO",
				direction: "OUT",
				value: "150.00",
				userId: "user-123",
			});

			expect(result).toEqual(baseExpense);
			expect(db.insert).toHaveBeenCalled();
		});
	});

	describe("update", () => {
		it("should update and return the updated expense", async () => {
			const updated = { ...baseExpense, description: "Atualizado" };
			const db = makeMockDb([updated]);
			const repo = new ExpensesRepository(db as never);

			const result = await repo.update("expense-123", "user-123", {
				description: "Atualizado",
			});

			expect(result).toEqual(updated);
			expect(db.update).toHaveBeenCalled();
		});

		it("should return null when expense not found", async () => {
			const db = makeMockDb([]);
			const repo = new ExpensesRepository(db as never);

			const result = await repo.update("nonexistent", "user-123", {
				description: "Atualizado",
			});

			expect(result).toBeNull();
		});
	});

	describe("remove", () => {
		it("should delete and return the removed expense", async () => {
			const db = makeMockDb([baseExpense]);
			const repo = new ExpensesRepository(db as never);

			const result = await repo.remove("expense-123", "user-123");

			expect(result).toEqual(baseExpense);
			expect(db.delete).toHaveBeenCalled();
		});

		it("should return null when expense not found", async () => {
			const db = makeMockDb([]);
			const repo = new ExpensesRepository(db as never);

			const result = await repo.remove("nonexistent", "user-123");

			expect(result).toBeNull();
		});
	});
});
