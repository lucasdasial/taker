import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../web/errors/ResourceNotFoundError.ts";
import { ExpensesService } from "./expenses.service.ts";

const mockRepository = {
	findAll: vi.fn(),
	findById: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	remove: vi.fn(),
};

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

describe("ExpensesService", () => {
	let service: ExpensesService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new ExpensesService(mockRepository as never);
	});

	describe("list", () => {
		it("should return expenses for the user", async () => {
			mockRepository.findAll.mockResolvedValue([baseExpense]);

			const result = await service.list("user-123");

			expect(result).toEqual([baseExpense]);
			expect(mockRepository.findAll).toHaveBeenCalledWith("user-123");
		});
	});

	describe("create", () => {
		it("should create and return the expense", async () => {
			mockRepository.create.mockResolvedValue(baseExpense);

			const result = await service.create("user-123", {
				description: "Compras do mês",
				category: "MERCADO",
				value: "150.00",
			});

			expect(result).toEqual(baseExpense);
			expect(mockRepository.create).toHaveBeenCalledWith({
				description: "Compras do mês",
				category: "MERCADO",
				value: "150.00",
				userId: "user-123",
			});
		});
	});

	describe("update", () => {
		it("should return updated expense when found", async () => {
			const updated = { ...baseExpense, description: "Atualizado" };
			mockRepository.update.mockResolvedValue(updated);

			const result = await service.update("expense-123", "user-123", {
				description: "Atualizado",
			});

			expect(result).toEqual(updated);
		});

		it("should throw ResourceNotFoundError when expense not found", async () => {
			mockRepository.update.mockResolvedValue(null);

			await expect(
				service.update("nonexistent", "user-123", { description: "X" }),
			).rejects.toBeInstanceOf(ResourceNotFoundError);
		});
	});

	describe("remove", () => {
		it("should remove expense when found", async () => {
			mockRepository.remove.mockResolvedValue(baseExpense);

			await expect(
				service.remove("expense-123", "user-123"),
			).resolves.toBeUndefined();
		});

		it("should throw ResourceNotFoundError when expense not found", async () => {
			mockRepository.remove.mockResolvedValue(null);

			await expect(
				service.remove("nonexistent", "user-123"),
			).rejects.toBeInstanceOf(ResourceNotFoundError);
		});
	});
});
