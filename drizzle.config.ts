import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./lib/schema.ts",
	out: "./drizzle",
	dialect: "sqlite",
	driver: "d1-http",
	dbCredentials: {
		accountId: "47f01f8326b145d7b59da93a0e00f46e",
		databaseId: "112a09fe-c10d-4138-89dc-252489406dcc",
		token: process.env.CLOUDFLARE_D1_TOKEN!,
	},
});
