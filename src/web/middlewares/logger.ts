import type { NextFunction, Request, Response } from "express";
import pino from "pino";
import { envs } from "../../config/envs.ts";

export const logger = pino({
	transport:
		envs.nodeEnv === "development" ? { target: "pino-pretty" } : undefined,
});

export function loggerMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const start = Date.now();

	res.on("finish", () => {
		const duration = Date.now() - start;
		logger.info(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
	});

	next();
}
