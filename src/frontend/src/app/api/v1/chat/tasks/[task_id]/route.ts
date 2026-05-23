import { NextRequest } from 'next/server'
import { handleProxy } from '@/lib/api/api-client.server'

/**
 * GET /api/v1/chat/tasks/[task_id] - Get task status (v2)
 * This route proxies task status requests to the FastAPI backend
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ task_id: string }> },
) {
  const { task_id } = await params
  return handleProxy(request, `/api/v1/chat/tasks/${task_id}`)
}
