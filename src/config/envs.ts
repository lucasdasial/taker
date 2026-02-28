import "dotenv/config";

function requireEnv(key: string): string {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}

export const envs = {
	nodeEnv: process.env.NODE_ENV || "development",
	port: Number(process.env.PORT) || 3000,
	db: {
		url: requireEnv("DB_URL"),
	},
	jwt: {
		secret: requireEnv("JWT_SECRET"),
	},
} as const;
