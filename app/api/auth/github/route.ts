import { NextResponse } from "next/server";
import {
	GITHUB_OAUTH_CODE_VERIFIER_COOKIE,
	GITHUB_OAUTH_STATE_COOKIE,
	createOAuthCodeChallenge,
	createOAuthCodeVerifier,
	createOAuthState,
	getGitHubCallbackUrl,
	getGitHubOAuthConfig,
} from "@/lib/auth";

export async function GET(request: Request) {
	const config = getGitHubOAuthConfig();
	const requestUrl = new URL(request.url);

	if (!config) {
		return NextResponse.redirect(new URL("/login?error=config", requestUrl.origin));
	}

	const state = createOAuthState();
	const codeVerifier = createOAuthCodeVerifier();
	const codeChallenge = await createOAuthCodeChallenge(codeVerifier);
	const authorizationUrl = new URL("https://github.com/login/oauth/authorize");

	authorizationUrl.searchParams.set("client_id", config.clientId);
	authorizationUrl.searchParams.set("redirect_uri", getGitHubCallbackUrl(requestUrl.origin));
	authorizationUrl.searchParams.set("scope", "read:user");
	authorizationUrl.searchParams.set("state", state);
	authorizationUrl.searchParams.set("code_challenge", codeChallenge);
	authorizationUrl.searchParams.set("code_challenge_method", "S256");

	const response = NextResponse.redirect(authorizationUrl);
	response.cookies.set(GITHUB_OAUTH_STATE_COOKIE, state, {
		httpOnly: true,
		maxAge: 60 * 10,
		path: "/",
		sameSite: "lax",
		secure: requestUrl.protocol === "https:",
	});
	response.cookies.set(GITHUB_OAUTH_CODE_VERIFIER_COOKIE, codeVerifier, {
		httpOnly: true,
		maxAge: 60 * 10,
		path: "/",
		sameSite: "lax",
		secure: requestUrl.protocol === "https:",
	});

	return response;
}
