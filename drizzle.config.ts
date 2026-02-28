import { defineConfig } from "drizzle-kit";
import { envs } from "./src/config/envs.ts";

export default defineConfig({
	schema: "./src/db/schema",
	out: "./src/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: envs.db.url,
	},
	casing: "snake_case",
});
