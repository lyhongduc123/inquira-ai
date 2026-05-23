import { NextRequest } from 'next/server';
import { handleProxy } from '@/lib/api/api-client.server';

/**
 * GET /api/v1/papers/[paper_id]/conversations - Get paper conversations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paper_id: string }> }
) {
  const { paper_id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || '1';
  const pageSize = searchParams.get('page_size') || '20';

  const queryParams = new URLSearchParams({
    page,
    page_size: pageSize,
  });

  return handleProxy(request, `/api/v1/papers/${paper_id}/conversations`, {
    query: queryParams,
  });
}
