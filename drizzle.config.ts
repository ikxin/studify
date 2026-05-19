import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./lib/schema.ts",
	dialect: "sqlite",
	driver: "d1-http",
	dbCredentials: {
		accountId: "47f01f8326b145d7b59da93a0e00f46e",
		databaseId: "6a349e7c-5cc9-4497-9da3-58831ddb8bd9",
		token: process.env.CLOUDFLARE_D1_TOKEN!,
	},
});
