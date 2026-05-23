import { NextRequest } from 'next/server';
import { handleProxy } from '@/lib/api/api-client.server';

/**
 * GET /api/v1/institutions/[institution_id] - Get an institution
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ institution_id: string }> },
) {
  const { institution_id } = await params;
  return handleProxy(request, `/api/v1/institutions/${institution_id}`);
}
