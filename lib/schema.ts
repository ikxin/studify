import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
	"users",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		email: text("email").notNull(),
		email_verified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
		image: text("image"),
		created_at: integer("created_at", { mode: "timestamp_ms" }).notNull(),
		updated_at: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
	},
	(table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const sessions = sqliteTable(
	"sessions",
	{
		id: text("id").primaryKey(),
		expires_at: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
		token: text("token").notNull(),
		created_at: integer("created_at", { mode: "timestamp_ms" }).notNull(),
		updated_at: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
		ip_address: text("ip_address"),
		user_agent: text("user_agent"),
		user_id: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(table) => [uniqueIndex("sessions_token_unique").on(table.token), index("sessions_user_id_idx").on(table.user_id)],
);

export const accounts = sqliteTable(
	"accounts",
	{
		id: text("id").primaryKey(),
		account_id: text("account_id").notNull(),
		provider_id: text("provider_id").notNull(),
		user_id: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		access_token: text("access_token"),
		refresh_token: text("refresh_token"),
		id_token: text("id_token"),
		access_token_expires_at: integer("access_token_expires_at", { mode: "timestamp_ms" }),
		refresh_token_expires_at: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
		scope: text("scope"),
		password: text("password"),
		created_at: integer("created_at", { mode: "timestamp_ms" }).notNull(),
		updated_at: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
	},
	(table) => [
		uniqueIndex("accounts_provider_account_unique").on(table.provider_id, table.account_id),
		index("accounts_user_id_idx").on(table.user_id),
	],
);

export const verifications = sqliteTable(
	"verifications",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expires_at: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
		created_at: integer("created_at", { mode: "timestamp_ms" }).notNull(),
		updated_at: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
	},
	(table) => [index("verifications_identifier_idx").on(table.identifier)],
);
