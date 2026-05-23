import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/core";

function normalizeCookieForFrontendDomain(cookie: string): string {
  return cookie.replace(/;\s*domain=[^;]*/gi, "");
}

/**
 * GET /api/auth/github/callback
 * Proxies OAuth callback to backend and forwards auth cookies to frontend domain.
 */
export async function GET(request: NextRequest) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_API_URL" },
        { status: 500 },
      );
    }

    const params = new URLSearchParams(request.nextUrl.searchParams.toString());
    params.set(
      "redirect_uri_override",
      `${request.nextUrl.origin}/api/auth/github/callback`,
    );

    const backendCallbackUrl = `${API_BASE_URL}/api/v1/auth/github/callback?${params.toString()}`;

    const backendResponse = await fetch(backendCallbackUrl, {
      method: "GET",
      redirect: "manual",
    });

    const isRedirect =
      backendResponse.status >= 300 && backendResponse.status < 400;
    const location = backendResponse.headers.get("location");
    if (!isRedirect || !location) {
      throw new Error("OAuth callback did not return a redirect");
    }

    const response = NextResponse.redirect(location, {
      status: backendResponse.status
    });

    const setCookieHeaders = backendResponse.headers.getSetCookie();
    setCookieHeaders.forEach((cookie) => {
      response.headers.append(
        "Set-Cookie",
        normalizeCookieForFrontendDomain(cookie),
      );
    });

    return response;
  } catch (error) {
    console.error("Error handling GitHub OAuth callback:", error);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/auth/error?error=oauth_callback_failed`,
      {
        status: 307,
      },
    );
  }
}
