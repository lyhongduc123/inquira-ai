import { handleProxy } from "@/lib/api/api-client.server";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ author_id: string }> },
) {
    const { author_id } = await params;
  return handleProxy(request, `/api/v1/authors/${author_id}/publications`, {
        method: "GET",
        query: request.nextUrl.searchParams,
    });
}
