import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "token";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!authToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/k/:path*"],
};
