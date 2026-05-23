import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/core";
import { handleProxy } from "@/lib/api/api-client.server";

/**
 * GET /api/conversations - List all conversations
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page") || "1";
  const pageSize = searchParams.get("page_size") || "20";
  const archived = searchParams.get("archived");
  const query = searchParams.get("query");
  const searchMessages = searchParams.get("search_messages");

  const params = new URLSearchParams({
    page,
    page_size: pageSize,
  });

  if (archived !== null) {
    params.append("archived", archived);
  }
  if (query) {
    params.append("query", query);
  }
  if (searchMessages !== null) {
    params.append("search_messages", searchMessages);
  }

  return handleProxy(request, `/api/v1/conversations`, {
    method: "GET",
    query: params,
  });
}

/**
 * POST /api/conversations - Create a new conversation
 */
export async function POST(request: NextRequest) {
  return handleProxy(request, '/api/v1/conversations');
}
