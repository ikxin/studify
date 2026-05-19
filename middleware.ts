import { NextRequest, NextResponse } from "next/server";
import { AUTH_SESSION_COOKIE, getGitHubOAuthConfig, verifySessionCookieValue } from "@/lib/auth";

export async function middleware(request: NextRequest) {
	const config = getGitHubOAuthConfig();
	const loginUrl = new URL("/login", request.url);

	if (!config) {
		loginUrl.searchParams.set("error", "config");
		return NextResponse.redirect(loginUrl);
	}

	const user = await verifySessionCookieValue(request.cookies.get(AUTH_SESSION_COOKIE)?.value, config.clientSecret);

	if (!user) {
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
