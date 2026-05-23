import { NextRequest, NextResponse } from "next/server";
import { handleProxy } from "@/lib/api/api-client.server";

/**
 * GET /api/v1/papers - List all papers with pagination
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page") || "1";
  const pageSize = searchParams.get("page_size") || "20";
  const processedOnly = searchParams.get("processed_only");
  const source = searchParams.get("source");

  const params = new URLSearchParams({
    page,
    page_size: pageSize,
  });

  if (processedOnly !== null) {
    params.append("processed_only", processedOnly);
  }
  if (source) {
    params.append("source", source);
  }

  return handleProxy(request, `/api/v1/papers`, {
    method: "GET",
    query: params,
  });
}
