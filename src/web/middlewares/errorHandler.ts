import type { NextFunction, Request, Response } from "express";
import { envs } from "../../config/envs.ts";
import { AppError } from "../errors/AppError.ts";
import { ValidationError } from "../errors/ValidationError.ts";
import { logger } from "./logger.ts";

export function errorHandler(
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	if (err instanceof ValidationError) {
		logger.warn(`${err.statusCode} ${err.message}`);
		res.status(err.statusCode).json({
			error: err.message,
			issues: err.issues,
			timestamp: err.timestamp,
		});
		return;
	}

	if (err instanceof AppError) {
		logger.warn(`${err.statusCode} ${err.message}`);
		res
			.status(err.statusCode)
			.json({ error: err.message, timestamp: err.timestamp });
		return;
	}

	logger.error(err);

	const message =
		envs.nodeEnv === "development" ? err.message : "Internal server error";

	res.status(500).json({ error: message });
}
