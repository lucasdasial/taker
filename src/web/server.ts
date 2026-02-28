import express from "express";
import { envs } from "../config/envs.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";
import { logger, loggerMiddleware } from "./middlewares/logger.ts";
import { timeout } from "./middlewares/timeout.ts";
import { registerApiRouter } from "./routes.ts";

export function createServer() {
	const app = express();

	app.use(express.json());
	app.use(loggerMiddleware);
	app.use(timeout);

	app.use("/api", registerApiRouter());

	app.use(errorHandler);

	return app;
}

export function startServer() {
	const app = createServer();

	app.listen(envs.port, () => {
		logger.info(`Running on http://localhost:${envs.port}`);
	});
}
