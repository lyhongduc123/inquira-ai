import { NextRequest } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * GET /api/v1/chat/stream/[task_id] - Stream task events (v2)
 * This route proxies task event streams to the FastAPI backend
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ task_id: string }> },
) {
  try {
    const { task_id } = await params
    const fromSequence = request.nextUrl.searchParams.get('from_sequence') || '0'

    const cookies = request.headers.get('cookie')

    const headers: Record<string, string> = {
      Accept: 'text/event-stream',
      ...(cookies ? { Cookie: cookies } : {}),
    }

    const authHeader = request.headers.get('Authorization')
    if (authHeader) {
      headers.Authorization = authHeader
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/chat/stream/${task_id}?from_sequence=${encodeURIComponent(fromSequence)}`,
      {
        method: 'GET',
        headers,
        credentials: 'include',
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      return new Response(errorText, {
        status: response.status,
        headers: { 'Content-Type': 'text/plain' },
      })
    }

    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    console.error('Error in task event stream:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
