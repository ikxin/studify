export const AUTH_SESSION_COOKIE = "entrant_session";
export const GITHUB_OAUTH_STATE_COOKIE = "entrant_github_oauth_state";
export const GITHUB_OAUTH_CODE_VERIFIER_COOKIE = "entrant_github_oauth_code_verifier";
export const ALLOWED_GITHUB_LOGIN = "ikxin";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type GitHubSessionUser = {
	id: number;
	login: string;
	name: string | null;
	avatarUrl: string | null;
};

type SessionPayload = GitHubSessionUser & {
	iat: number;
	exp: number;
};

export function getGitHubOAuthConfig() {
	const clientId = process.env.GITHUB_CLIENT_ID;
	const clientSecret = process.env.GITHUB_CLIENT_SECRET;

	if (!clientId || !clientSecret) {
		return null;
	}

	return {
		clientId,
		clientSecret,
	};
}

export function getGitHubCallbackUrl(origin: string) {
	return new URL("/api/auth/callback/github", origin).toString();
}

export function createOAuthState() {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	return base64UrlEncodeBytes(bytes);
}

export function createOAuthCodeVerifier() {
	const bytes = new Uint8Array(48);
	crypto.getRandomValues(bytes);
	return base64UrlEncodeBytes(bytes);
}

export async function createOAuthCodeChallenge(verifier: string) {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
	return base64UrlEncodeBytes(new Uint8Array(digest));
}

export async function createSessionCookieValue(user: GitHubSessionUser, secret: string) {
	const now = Math.floor(Date.now() / 1000);
	const payload: SessionPayload = {
		...user,
		iat: now,
		exp: now + SESSION_MAX_AGE_SECONDS,
	};
	const encodedPayload = base64UrlEncodeText(JSON.stringify(payload));
	const signature = await sign(encodedPayload, secret);

	return `${encodedPayload}.${signature}`;
}

export async function verifySessionCookieValue(value: string | undefined, secret: string) {
	if (!value) {
		return null;
	}

	const [encodedPayload, signature] = value.split(".");

	if (!encodedPayload || !signature) {
		return null;
	}

	const expectedSignature = await sign(encodedPayload, secret);

	if (!timingSafeEqual(signature, expectedSignature)) {
		return null;
	}

	try {
		const payload = JSON.parse(base64UrlDecodeText(encodedPayload)) as SessionPayload;
		const now = Math.floor(Date.now() / 1000);

		if (payload.exp <= now || payload.login.toLowerCase() !== ALLOWED_GITHUB_LOGIN) {
			return null;
		}

		return {
			id: payload.id,
			login: payload.login,
			name: payload.name,
			avatarUrl: payload.avatarUrl,
		} satisfies GitHubSessionUser;
	} catch {
		return null;
	}
}

async function sign(value: string, secret: string) {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{
			name: "HMAC",
			hash: "SHA-256",
		},
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

	return base64UrlEncodeBytes(new Uint8Array(signature));
}

function base64UrlEncodeText(value: string) {
	return base64UrlEncodeBytes(new TextEncoder().encode(value));
}

function base64UrlEncodeBytes(bytes: Uint8Array) {
	let binary = "";

	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}

	return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecodeText(value: string) {
	const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
	const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);

	for (let index = 0; index < binary.length; index += 1) {
		bytes[index] = binary.charCodeAt(index);
	}

	return new TextDecoder().decode(bytes);
}

function timingSafeEqual(left: string, right: string) {
	if (left.length !== right.length) {
		return false;
	}

	let result = 0;

	for (let index = 0; index < left.length; index += 1) {
		result |= left.charCodeAt(index) ^ right.charCodeAt(index);
	}

	return result === 0;
}
