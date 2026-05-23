import { NextRequest } from 'next/server';
import { handleProxy } from '@/lib/api/api-client.server';

/**
 * GET /api/v1/admin/validation/history - Get validation history
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const skip = searchParams.get('skip') || '0';
  const limit = searchParams.get('limit') || '50';
  const messageId = searchParams.get('message_id');
  const modelName = searchParams.get('model_name');
  const hasHallucination = searchParams.get('has_hallucination');

  const params = new URLSearchParams({
    skip,
    limit,
  });

  if (messageId) params.append('message_id', messageId);
  if (modelName) params.append('model_name', modelName);
  if (hasHallucination !== null) params.append('has_hallucination', hasHallucination);

  return handleProxy(request, '/api/v1/admin/validation/history', { query: params });
}
