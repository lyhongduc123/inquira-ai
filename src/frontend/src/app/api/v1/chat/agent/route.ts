import { NextRequest } from 'next/server'
import { handleProxy } from '@/lib/api/api-client.server'

/**
 * POST /api/v1/chat/agent
 */
export async function POST(request: NextRequest) {
  return handleProxy(request, '/api/v1/chat/agent')
}
