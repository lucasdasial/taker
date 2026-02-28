import { describe, expect, it } from "vitest";
import { z } from "zod";
import { AppError } from "./AppError.ts";
import { ValidationError } from "./ValidationError.ts";

function parseAndFail(schema: z.ZodTypeAny, value: unknown): ValidationError {
	const result = schema.safeParse(value);
	if (result.success) throw new Error("Expected validation to fail");
	return new ValidationError(result.error);
}

describe("ValidationError", () => {
	it("should have statusCode 422", () => {
		const err = parseAndFail(z.object({ name: z.string() }), { name: 123 });
		expect(err.statusCode).toBe(422);
	});

	it("should have message Validation failed", () => {
		const err = parseAndFail(z.string(), 123);
		expect(err.message).toBe("Validation failed");
	});

	it("should map zod issues to field/message pairs", () => {
		const err = parseAndFail(z.object({ email: z.email() }), {
			email: "invalid",
		});
		expect(err.issues).toHaveLength(1);
		expect(err.issues[0].field).toBe("email");
		expect(typeof err.issues[0].message).toBe("string");
	});

	it("should collect multiple issues", () => {
		const err = parseAndFail(
			z.object({ name: z.string().min(2), email: z.email() }),
			{ name: "T", email: "bad" },
		);
		expect(err.issues.length).toBeGreaterThan(1);
	});

	it("should be instance of AppError", () => {
		const err = parseAndFail(z.string(), 123);
		expect(err).toBeInstanceOf(AppError);
	});
});
