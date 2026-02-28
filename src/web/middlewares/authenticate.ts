import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../../config/jwt.ts";
import { AppError } from "../errors/AppError.ts";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		return next(new AppError(401, "Unauthorized"));
	}

	try {
		const payload = verifyToken(token);
		req.body.userId = payload.sub;
		next();
	} catch {
		next(new AppError(401, "Invalid or expired token"));
	}
}
