import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/core";
import { handleProxy } from "@/lib/api/api-client.server";

/**
 * GET /api/v1/bookmarks/[id] - Get a specific bookmark with paper details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleProxy(request, `/api/v1/bookmarks/${id}`);
}

/**
 * PATCH /api/v1/bookmarks/[id] - Update bookmark notes
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  return handleProxy(request, `/api/v1/bookmarks/${id}`, {
    method: "PATCH",
    body,
  });
}

/**
 * DELETE /api/v1/bookmarks/[id] - Delete a bookmark
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleProxy(request, `/api/v1/bookmarks/${id}`, {
    method: "DELETE",
  });
}
