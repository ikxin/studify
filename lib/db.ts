import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { cache } from "react";

export const getDb = cache(() => {
	const { env } = getCloudflareContext();

	return drizzle(env.DB);
});

export const getDbAsync = cache(async () => {
	const { env } = await getCloudflareContext({ async: true });

	return drizzle(env.DB);
});

export type Db = ReturnType<typeof getDb>;
