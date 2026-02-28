import { Router } from "express";
import { db } from "../db/index.ts";
import { UsersRepository } from "../modules/users/users.repository.ts";
import { UsersService } from "../modules/users/users.service.ts";
import { AuthController } from "./controllers/auth.controller.ts";
import { authenticate } from "./middlewares/authenticate.ts";

function publicRoutes(): Router {
	const router = Router();

	const usersRepository = new UsersRepository(db);
	const usersService = new UsersService(usersRepository);
	const authController = new AuthController(usersService);

	router.post("/auth/register", authController.register);
	router.post("/auth/login", authController.login);

	return router;
}

function authenticatedRoutes(): Router {
	const router = Router();
	// const expensesController = makeExpensesController(...)
	// router.use("/expenses", expensesController.list);
	return router;
}

export function registerApiRouter(): Router {
	const router = Router();
	router.use("/", publicRoutes());
	router.use("/", authenticate, authenticatedRoutes());
	return router;
}
