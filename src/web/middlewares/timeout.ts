import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.ts";

const TIMEOUT_MS = 3000;

export function timeout(_req: Request, res: Response, next: NextFunction) {
	const timer = setTimeout(() => {
		next(new AppError(408, "Request timeout"));
	}, TIMEOUT_MS);

	res.on("finish", () => clearTimeout(timer));
	res.on("close", () => clearTimeout(timer));

	next();
}
