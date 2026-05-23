import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/core";
import { handleProxy } from "@/lib/api/api-client.server";

/**
 * GET /api/v1/authors/[author_id]/details - Get author with papers
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ author_id: string }> },
) {
  const { author_id } = await params;
  return handleProxy(request, `/api/v1/authors/${author_id}/details`);
}
