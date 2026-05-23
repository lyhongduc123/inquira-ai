import { NextRequest } from "next/server";
import { handleProxy } from "@/lib/api/api-client.server";

/**
 * GET /api/v1/papers/[paper_id]/references - Get paper references
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paper_id: string }> },
) {
  const { paper_id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const offset = searchParams.get("offset") || "0";
  const limit = searchParams.get("limit") || "20";
  const sortBy = searchParams.get("sort_by");
  const order = searchParams.get("order");

  const queryParams = new URLSearchParams({
    offset,
    limit,
  });

  if (sortBy) queryParams.append("sort_by", sortBy);
  if (order) queryParams.append("order", order);

  return handleProxy(request, `/api/v1/papers/${paper_id}/references`, {
    method: "GET",
    query: queryParams,
  });
}
