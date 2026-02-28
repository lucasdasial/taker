export class AppError extends Error {
	public readonly timestamp: string;

	constructor(
		public readonly statusCode: number,
		message: string,
	) {
		super(message);
		this.name = "ApiError";
		this.timestamp = new Date().toISOString();
	}
}
