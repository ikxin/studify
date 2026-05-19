import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const redirectUrl = new URL("/api/auth/callback/github", request.nextUrl.origin);
	redirectUrl.search = request.nextUrl.search;

	return NextResponse.redirect(redirectUrl);
}
