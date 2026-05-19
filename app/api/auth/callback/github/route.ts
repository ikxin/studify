import { NextRequest, NextResponse } from "next/server";
import {
	ALLOWED_GITHUB_LOGIN,
	AUTH_SESSION_COOKIE,
	GITHUB_OAUTH_CODE_VERIFIER_COOKIE,
	GITHUB_OAUTH_STATE_COOKIE,
	SESSION_MAX_AGE_SECONDS,
	createSessionCookieValue,
	getGitHubCallbackUrl,
	getGitHubOAuthConfig,
} from "@/lib/auth";

type GitHubAccessTokenResponse = {
	access_token?: string;
	error?: string;
	error_description?: string;
};

type GitHubUserResponse = {
	id: number;
	login: string;
	name: string | null;
	avatar_url: string | null;
};

export async function GET(request: NextRequest) {
	const config = getGitHubOAuthConfig();
	const requestUrl = request.nextUrl;
	const redirectToLogin = (error: string) => NextResponse.redirect(new URL(`/login?error=${error}`, requestUrl.origin));

	if (!config) {
		return redirectToLogin("config");
	}

	const oauthError = requestUrl.searchParams.get("error");
	const code = requestUrl.searchParams.get("code");
	const state = requestUrl.searchParams.get("state");
	const storedState = request.cookies.get(GITHUB_OAUTH_STATE_COOKIE)?.value;
	const codeVerifier = request.cookies.get(GITHUB_OAUTH_CODE_VERIFIER_COOKIE)?.value;

	if (oauthError) {
		return redirectToLogin("cancelled");
	}

	if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
		return redirectToLogin("state");
	}

	const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			client_id: config.clientId,
			client_secret: config.clientSecret,
			code,
			code_verifier: codeVerifier,
			redirect_uri: getGitHubCallbackUrl(requestUrl.origin),
			state,
		}),
	});
	const tokenData = (await tokenResponse.json()) as GitHubAccessTokenResponse;

	if (!tokenResponse.ok || !tokenData.access_token) {
		return redirectToLogin(tokenData.error === "bad_verification_code" ? "code" : "oauth");
	}

	const userResponse = await fetch("https://api.github.com/user", {
		headers: {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${tokenData.access_token}`,
			"User-Agent": "entrant",
			"X-GitHub-Api-Version": "2022-11-28",
		},
	});

	if (!userResponse.ok) {
		return redirectToLogin("profile");
	}

	const user = (await userResponse.json()) as GitHubUserResponse;

	if (user.login.toLowerCase() !== ALLOWED_GITHUB_LOGIN) {
		return redirectToLogin("unauthorized");
	}

	const response = NextResponse.redirect(new URL("/", requestUrl.origin));
	const sessionValue = await createSessionCookieValue(
		{
			id: user.id,
			login: user.login,
			name: user.name,
			avatarUrl: user.avatar_url,
		},
		config.clientSecret,
	);

	response.cookies.set(AUTH_SESSION_COOKIE, sessionValue, {
		httpOnly: true,
		maxAge: SESSION_MAX_AGE_SECONDS,
		path: "/",
		sameSite: "lax",
		secure: requestUrl.protocol === "https:",
	});
	response.cookies.delete(GITHUB_OAUTH_STATE_COOKIE);
	response.cookies.delete(GITHUB_OAUTH_CODE_VERIFIER_COOKIE);

	return response;
}
