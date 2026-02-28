import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ExpensesService } from "../../modules/expenses/expenses.service.ts";
import { ResourceNotFoundError } from "../errors/ResourceNotFoundError.ts";
import { ValidationError } from "../errors/ValidationError.ts";
import { ExpensesController } from "./expenses.controller.ts";

const mockService = {
	list: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	remove: vi.fn(),
} as unknown as ExpensesService;

const baseExpense = {
	id: "expense-123",
	description: "Compras do mês",
	category: "MERCADO",
	direction: "OUT",
	value: "150.00",
	userId: "user-123",
	createdAt: new Date(),
	updatedAt: new Date(),
};

describe("ExpensesController", () => {
	let controller: ExpensesController;
	let req: { body: Record<string, unknown>; params: Record<string, string> };
	let res: {
		status: ReturnType<typeof vi.fn>;
		json: ReturnType<typeof vi.fn>;
		send: ReturnType<typeof vi.fn>;
	};
	// biome-ignore lint/suspicious/noExplicitAny: test mock
	let next: any;

	beforeEach(() => {
		vi.clearAllMocks();
		controller = new ExpensesController(mockService);
		req = { body: { userId: "user-123" }, params: {} };
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
			send: vi.fn(),
		};
		next = vi.fn();
	});

	describe("list", () => {
		it("should return 200 with expenses", async () => {
			vi.mocked(mockService.list).mockResolvedValue([baseExpense] as never);

			await controller.list(req as never, res as never, next);

			expect(mockService.list).toHaveBeenCalledWith("user-123");
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith([baseExpense]);
		});

		it("should forward service errors to next", async () => {
			const err = new Error("Service error");
			vi.mocked(mockService.list).mockRejectedValue(err);

			await controller.list(req as never, res as never, next);

			expect(next).toHaveBeenCalledWith(err);
		});
	});

	describe("create", () => {
		it("should return 201 with the created expense on valid input", async () => {
			req.body = {
				userId: "user-123",
				description: "Compras do mês",
				category: "MERCADO",
				direction: "OUT",
				value: 150,
			};
			vi.mocked(mockService.create).mockResolvedValue(baseExpense as never);

			await controller.create(req as never, res as never, next);

			expect(mockService.create).toHaveBeenCalledWith(
				"user-123",
				expect.objectContaining({
					description: "Compras do mês",
					category: "MERCADO",
					value: 150,
				}),
			);
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith(baseExpense);
		});

		it("should call next with ValidationError when description is missing", async () => {
			req.body = { userId: "user-123", category: "MERCADO", value: 150 };

			await controller.create(req as never, res as never, next);

			expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
		});

		it("should call next with ValidationError when category is invalid", async () => {
			req.body = {
				userId: "user-123",
				description: "Test",
				category: "INVALIDA",
				value: 150,
			};

			await controller.create(req as never, res as never, next);

			expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
		});

		it("should call next with ValidationError when value is negative", async () => {
			req.body = {
				userId: "user-123",
				description: "Test",
				category: "MERCADO",
				value: -10,
			};

			await controller.create(req as never, res as never, next);

			expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
		});

		it("should default direction to OUT when not provided", async () => {
			req.body = {
				userId: "user-123",
				description: "Test",
				category: "MERCADO",
				value: 100,
			};
			vi.mocked(mockService.create).mockResolvedValue(baseExpense as never);

			await controller.create(req as never, res as never, next);

			expect(mockService.create).toHaveBeenCalledWith(
				"user-123",
				expect.objectContaining({ direction: "OUT" }),
			);
		});

		it("should forward service errors to next", async () => {
			req.body = {
				userId: "user-123",
				description: "Test",
				category: "MERCADO",
				value: 100,
			};
			const err = new Error("Service error");
			vi.mocked(mockService.create).mockRejectedValue(err);

			await controller.create(req as never, res as never, next);

			expect(next).toHaveBeenCalledWith(err);
		});
	});

	describe("update", () => {
		beforeEach(() => {
			req.params = { id: "expense-123" };
		});

		it("should return 200 with updated expense on valid input", async () => {
			req.body = { userId: "user-123", description: "Atualizado" };
			const updated = { ...baseExpense, description: "Atualizado" };
			vi.mocked(mockService.update).mockResolvedValue(updated as never);

			await controller.update(req as never, res as never, next);

			expect(mockService.update).toHaveBeenCalledWith(
				"expense-123",
				"user-123",
				expect.objectContaining({ description: "Atualizado" }),
			);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(updated);
		});

		it("should call next with ValidationError when category is invalid", async () => {
			req.body = { userId: "user-123", category: "INVALIDA" };

			await controller.update(req as never, res as never, next);

			expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
		});

		it("should forward ResourceNotFoundError to next", async () => {
			req.body = { userId: "user-123", description: "X" };
			const err = new ResourceNotFoundError("Expense");
			vi.mocked(mockService.update).mockRejectedValue(err);

			await controller.update(req as never, res as never, next);

			expect(next).toHaveBeenCalledWith(err);
		});
	});

	describe("remove", () => {
		beforeEach(() => {
			req.params = { id: "expense-123" };
		});

		it("should return 204 on successful removal", async () => {
			vi.mocked(mockService.remove).mockResolvedValue(undefined);

			await controller.remove(req as never, res as never, next);

			expect(mockService.remove).toHaveBeenCalledWith(
				"expense-123",
				"user-123",
			);
			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.send).toHaveBeenCalled();
		});

		it("should forward ResourceNotFoundError to next", async () => {
			const err = new ResourceNotFoundError("Expense");
			vi.mocked(mockService.remove).mockRejectedValue(err);

			await controller.remove(req as never, res as never, next);

			expect(next).toHaveBeenCalledWith(err);
		});
	});
});
