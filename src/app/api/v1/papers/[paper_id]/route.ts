import { NextRequest } from 'next/server';
import { handleProxy } from '@/lib/api/api-client.server';

/**
 * GET /api/v1/papers/[paper_id] - Get a specific paper
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paper_id: string }> }
) {
  const { paper_id } = await params;
  return handleProxy(request, `/api/v1/papers/${paper_id}`);
}

/**
 * PATCH /api/v1/papers/[paper_id] - Update a paper
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ paper_id: string }> }
) {
  const { paper_id } = await params;
  return handleProxy(request, `/api/v1/papers/${paper_id}`);
}

/**
 * DELETE /api/v1/papers/[paper_id] - Delete a paper
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ paper_id: string }> }
) {
  const { paper_id } = await params;
  return handleProxy(request, `/api/v1/papers/${paper_id}`);
}
