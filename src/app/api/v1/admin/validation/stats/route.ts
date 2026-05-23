import { NextRequest } from 'next/server';
import { handleProxy } from '@/lib/api/api-client.server';

/**
 * GET /api/v1/admin/validation/stats - Get validation statistics
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const params = new URLSearchParams()
  const messageId = searchParams.get('message_id')
  const modelName = searchParams.get('model_name')

  if (messageId) params.append('message_id', messageId)
  if (modelName) params.append('model_name', modelName)

  return handleProxy(request, '/api/v1/admin/validation/stats', { query: params })
}
