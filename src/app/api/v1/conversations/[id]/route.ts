import { NextRequest } from "next/server";
import { handleProxy } from "@/lib/api/api-client.server";

/**
 * GET /api/conversations/[id] - Get a specific conversation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleProxy(request, `/api/v1/conversations/${id}`);
}

/**
 * PATCH /api/conversations/[id] - Update a conversation
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  return handleProxy(request, `/api/v1/conversations/${id}`, {
    method: "PATCH",
    body,
  });
}

/**
 * DELETE /api/conversations/[id] - Delete a conversation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleProxy(request, `/api/v1/conversations/${id}`, {
    method: "DELETE",
  });
}
