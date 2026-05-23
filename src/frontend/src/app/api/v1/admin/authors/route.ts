import { NextRequest } from 'next/server';
import { handleProxy } from '@/lib/api/api-client.server';

/**
 * GET /api/v1/authors - List all authors with pagination
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || '1';
  const pageSize = searchParams.get('page_size') || '50';
  const search = searchParams.get('search');
  const verifiedOnly = searchParams.get('verified_only');

  const params = new URLSearchParams({
    page,
    page_size: pageSize,
  });

  if (search) params.append('search', search);
  if (verifiedOnly !== null) params.append('verified_only', verifiedOnly);

  return handleProxy(request, '/api/v1/authors', { query: params });
}
