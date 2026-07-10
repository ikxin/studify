import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
	const loginUrl = new URL("/login", request.url);

	if (!getSessionCookie(request)) {
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
