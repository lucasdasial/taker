import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { ExpensesService } from "../../modules/expenses/expenses.service.ts";
import { ValidationError } from "../errors/ValidationError.ts";

const CATEGORIES = [
	"MERCADO",
	"RESTAURANTES",
	"PRODUTOS_LIMPEZA",
	"SAUDE",
	"MORADIA",
	"ASSINATURAS",
	"TRANSPORTE",
	"EDUCACAO",
	"COMPRAS",
	"DIVIDAS",
	"LAZER",
	"BELEZA",
] as const;

const DIRECTIONS = ["IN", "OUT"] as const;

const createSchema = z.object({
	description: z
		.string({ error: "Descrição é obrigatória." })
		.min(1, { error: "Descrição é obrigatória." }),
	category: z.enum(CATEGORIES, { error: "Categoria inválida." }),
	direction: z.enum(DIRECTIONS).default("OUT"),
	value: z
		.number({ error: "Valor é obrigatório." })
		.positive({ error: "Valor deve ser positivo." }),
});

const updateSchema = createSchema.partial();

export class ExpensesController {
	constructor(private readonly expensesService: ExpensesService) {}

	list = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { userId } = req.body;
			const data = await this.expensesService.list(userId);
			res.status(200).json(data);
		} catch (err) {
			next(err);
		}
	};

	create = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { userId, ...body } = req.body;
			const result = createSchema.safeParse(body);
			if (!result.success) return next(new ValidationError(result.error));

			const expense = await this.expensesService.create(
				userId,
				result.data as never,
			);
			res.status(201).json(expense);
		} catch (err) {
			next(err);
		}
	};

	update = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { userId, ...body } = req.body;
			const result = updateSchema.safeParse(body);
			if (!result.success) return next(new ValidationError(result.error));

			const expense = await this.expensesService.update(
				req.params.id,
				userId,
				result.data as never,
			);
			res.status(200).json(expense);
		} catch (err) {
			next(err);
		}
	};

	remove = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { userId } = req.body;
			await this.expensesService.remove(req.params.id, userId);
			res.status(204).send();
		} catch (err) {
			next(err);
		}
	};
}
