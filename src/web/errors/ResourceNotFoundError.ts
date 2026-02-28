import { AppError } from "./AppError.ts";

export class ResourceNotFoundError extends AppError {
	constructor(resource: string) {
		super(404, `${resource} not found`);
	}
}
