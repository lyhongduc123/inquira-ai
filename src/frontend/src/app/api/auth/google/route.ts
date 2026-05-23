import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/core";

/**
 * GET /api/auth/google - Start Google OAuth via backend
 */
export async function GET(request: NextRequest) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_API_URL" },
        { status: 500 },
      );
    }

    const backendResponse = await fetch(`${API_BASE_URL}/api/v1/auth/google`, {
      method: "GET",
      redirect: "manual",
    });
    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: "Failed to initiate Google OAuth" },
        { status: backendResponse.status },
      );
    }

    const location = backendResponse.headers.get("location");
    const isRedirect =
      backendResponse.status >= 300 && backendResponse.status < 400;

    if (!isRedirect || !location) {
      return NextResponse.json(
        { error: "Failed to initiate Google OAuth" },
        { status: backendResponse.status || 500 },
      );
    }

    const oauthUrl = new URL(location);
    oauthUrl.searchParams.set(
      "redirect_uri",
      `${request.nextUrl.origin}/api/auth/google/callback`,
    );

    return NextResponse.redirect(oauthUrl.toString(), {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("Error starting Google OAuth:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
