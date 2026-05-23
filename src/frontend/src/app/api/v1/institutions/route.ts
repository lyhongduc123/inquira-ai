import { NextRequest } from 'next/server';
import { handleProxy } from '@/lib/api/api-client.server';

/**
 * GET /api/v1/institutions - List all institutions with pagination
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || '1';
  const pageSize = searchParams.get('page_size') || '50';
  const search = searchParams.get('search');
  const countryCode = searchParams.get('country_code');
  const institutionType = searchParams.get('institution_type');

  const params = new URLSearchParams({
    page,
    page_size: pageSize,
  });

  if (search) params.append('search', search);
  if (countryCode) params.append('country_code', countryCode);
  if (institutionType) params.append('institution_type', institutionType);

  return handleProxy(request, '/api/v1/institutions', { query: params });
}
