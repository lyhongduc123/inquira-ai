import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/core";
import { handleProxy } from "@/lib/api/api-client.server";

/**
 * GET /api/v1/bookmarks/check/[paperId] - Check if a paper is bookmarked
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paperId: string }> },
) {
  const { paperId } = await params;

  return handleProxy(request, `/api/v1/bookmarks/check/${paperId}`);
}
