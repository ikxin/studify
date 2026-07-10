import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/lib/schema";

export function getDb() {
	return drizzle(env.DB, { schema });
}

export async function getDbAsync() {
	return getDb();
}

export type Db = ReturnType<typeof getDb>;
