import { NextRequest } from 'next/server';
import { handleProxy } from '@/lib/api/api-client.server';

/**
 * GET /api/v1/authors/[author_id] - Get an author
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ author_id: string }> }
) {
  const { author_id } = await params;
  return handleProxy(request, `/api/v1/authors/${author_id}`);
}
