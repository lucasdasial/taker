import type { ZodError } from "zod";
import { AppError } from "./AppError.ts";

export class ValidationError extends AppError {
	public readonly issues: { field: string; message: string }[];

	constructor(zodError: ZodError) {
		super(422, "Validation failed");
		this.issues = zodError.issues.map((issue) => ({
			field: issue.path.join("."),
			message: issue.message,
		}));
	}
}
