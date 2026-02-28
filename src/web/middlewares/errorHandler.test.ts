import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { AppError } from "../errors/AppError.ts";
import { ValidationError } from "../errors/ValidationError.ts";

vi.mock("./logger.ts", () => ({
	logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import type { NextFunction } from "express";
import { errorHandler } from "./errorHandler.ts";

describe("errorHandler", () => {
	let req: object;
	let res: { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
	let next: NextFunction;

	beforeEach(() => {
		req = {};
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		};
		next = vi.fn();
	});

	it("should handle ValidationError with 422 and issues array", () => {
		const result = z
			.object({ email: z.email() })
			.safeParse({ email: "invalid" });
		if (result.success) throw new Error("Expected validation to fail");
		const err = new ValidationError(result.error);

		errorHandler(err, req as never, res as never, next);

		expect(res.status).toHaveBeenCalledWith(422);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				error: "Validation failed",
				issues: expect.any(Array),
				timestamp: expect.any(String),
			}),
		);
	});

	it("should handle AppError with correct statusCode and message", () => {
		const err = new AppError(403, "Forbidden");

		errorHandler(err, req as never, res as never, next);

		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				error: "Forbidden",
				timestamp: expect.any(String),
			}),
		);
	});

	it("should handle unknown error with 500 and generic message (non-development)", () => {
		const err = new Error("DB connection failed");

		errorHandler(err, req as never, res as never, next);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({ error: "Internal server error" }),
		);
	});
});
