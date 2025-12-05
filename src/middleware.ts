import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "token";

export function middleware(request: NextRequest) {
  // Try to get token from cookie first
  let authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Fallback: Try to get token from Authorization header (for API calls from client)
  if (!authToken) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      authToken = authHeader.substring(7);
    }
  }

  if (!authToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/k/:path*", "/exam-session/:path*"],
};
