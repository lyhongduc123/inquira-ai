import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/core";
import { handleProxy } from "@/lib/api/api-client.server";

/**
 * GET /api/v1/bookmarks - List all bookmarks for the current user
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  if (!params.has("skip")) params.set("skip", "0");
  if (!params.has("limit")) params.set("limit", "50");

  return handleProxy(request, `/api/v1/bookmarks`, {
    method: "GET",
    query: params,
  });
}

/**
 * POST /api/v1/bookmarks - Create a new bookmark
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  return handleProxy(request, `/api/v1/bookmarks`, {
    method: "POST",
    body,
  });
}
