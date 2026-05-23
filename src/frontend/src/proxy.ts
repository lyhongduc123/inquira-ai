import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE_KEY } from "./core";

export function proxy(req: NextRequest) {
  const token = req.cookies.get(ACCESS_TOKEN_COOKIE_KEY)?.value;

  const isProtectedRoute = req.nextUrl.pathname.startsWith("/papers") ||
    req.nextUrl.pathname.startsWith("/conversations") ||
    req.nextUrl.pathname.startsWith("/authors") ||
    req.nextUrl.pathname.startsWith("/bookmarks");
    
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/signup");

  if (!token && isProtectedRoute) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/papers/:path*",
    "/conversations/:path*",
    "/authors/:path*",
    "/bookmarks/:path*",
  ],
};
