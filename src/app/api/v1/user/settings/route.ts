import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/core";
import { handleProxy } from "@/lib/api/api-client.server";

/**
 * GET /api/v1/user/settings - Get current user settings
 */
export async function GET(request: NextRequest) {
  return handleProxy(request, "/api/v1/user/settings");
}

/**
 * PATCH /api/v1/user/settings - Update user settings
 */
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  return handleProxy(request, "/api/v1/user/settings", {
    method: "PATCH",
    body,
  });
}
