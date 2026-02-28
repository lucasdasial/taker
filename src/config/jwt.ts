import jwt from "jsonwebtoken";
import { envs } from "./envs.ts";

export function signToken(payload: { sub: string }): string {
	return jwt.sign(payload, envs.jwt.secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): jwt.JwtPayload {
	return jwt.verify(token, envs.jwt.secret) as jwt.JwtPayload;
}
