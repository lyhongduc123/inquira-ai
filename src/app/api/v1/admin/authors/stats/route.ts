import { NextRequest } from 'next/server';
import { handleProxy } from '@/lib/api/api-client.server';

/**
 * GET /api/v1/authors/stats - Get author statistics
 */
export async function GET(request: NextRequest) {
  return handleProxy(request, '/api/v1/authors/stats');
}
