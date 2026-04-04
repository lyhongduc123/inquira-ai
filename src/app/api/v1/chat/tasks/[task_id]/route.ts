import { NextRequest } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * GET /api/v1/chat/tasks/[task_id] - Get task status (v2)
 * This route proxies task status requests to the FastAPI backend
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ task_id: string }> },
) {
  try {
    const { task_id } = await params

    const cookies = request.headers.get('cookie')

    const headers: Record<string, string> = {
      ...(cookies ? { Cookie: cookies } : {}),
    }

    const authHeader = request.headers.get('Authorization')
    if (authHeader) {
      headers.Authorization = authHeader
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/chat/tasks/${task_id}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    })

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
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    })
  } catch (error) {
    console.error('Error getting task status:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
