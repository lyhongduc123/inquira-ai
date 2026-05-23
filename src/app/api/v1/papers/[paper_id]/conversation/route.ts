import { NextRequest } from 'next/server';
import { handleProxy } from '@/lib/api/api-client.server';

/**
 * GET /api/v1/papers/[paper_id]/conversation - Get paper conversation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paper_id: string }> }
) {
  const { paper_id } = await params;
  return handleProxy(request, `/api/v1/papers/${paper_id}/conversation`);
}
