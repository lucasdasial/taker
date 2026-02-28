import { Router } from "express";
import { db } from "../db/index.ts";
import { ExpensesRepository } from "../modules/expenses/expenses.repository.ts";
import { ExpensesService } from "../modules/expenses/expenses.service.ts";
import { UsersRepository } from "../modules/users/users.repository.ts";
import { UsersService } from "../modules/users/users.service.ts";
import { AuthController } from "./controllers/auth.controller.ts";
import { ExpensesController } from "./controllers/expenses.controller.ts";
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

	const expensesRepository = new ExpensesRepository(db as never);
	const expensesService = new ExpensesService(expensesRepository);
	const expensesController = new ExpensesController(expensesService);

	router.get("/expenses", expensesController.list);
	router.post("/expenses", expensesController.create);
	router.patch("/expenses/:id", expensesController.update);
	router.delete("/expenses/:id", expensesController.remove);

	return router;
}

export function registerApiRouter(): Router {
	const router = Router();
	router.use("/", publicRoutes());
	router.use("/", authenticate, authenticatedRoutes());
	return router;
}
