import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { env } from "cloudflare:workers";
import { getDb } from "@/lib/db";
import { accounts, sessions, users, verifications } from "@/lib/schema";

const schema = { accounts, sessions, users, verifications };
const authBindings = env as typeof env & {
	BETTER_AUTH_SECRET?: string;
	BETTER_AUTH_URL?: string;
};

export const auth = betterAuth({
	database: drizzleAdapter(getDb(), {
		provider: "sqlite",
		schema,
		usePlural: true,
	}),
	emailAndPassword: {
		enabled: true,
	},
	secret: authBindings.BETTER_AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET,
	baseURL: authBindings.BETTER_AUTH_URL ?? process.env.BETTER_AUTH_URL,
	user: {
		fields: {
			emailVerified: "email_verified",
			createdAt: "created_at",
			updatedAt: "updated_at",
		},
	},
	session: {
		fields: {
			expiresAt: "expires_at",
			createdAt: "created_at",
			updatedAt: "updated_at",
			ipAddress: "ip_address",
			userAgent: "user_agent",
			userId: "user_id",
		},
	},
	account: {
		fields: {
			accountId: "account_id",
			providerId: "provider_id",
			userId: "user_id",
			accessToken: "access_token",
			refreshToken: "refresh_token",
			idToken: "id_token",
			accessTokenExpiresAt: "access_token_expires_at",
			refreshTokenExpiresAt: "refresh_token_expires_at",
			createdAt: "created_at",
			updatedAt: "updated_at",
		},
	},
	verification: {
		fields: {
			expiresAt: "expires_at",
			createdAt: "created_at",
			updatedAt: "updated_at",
		},
	},
});
