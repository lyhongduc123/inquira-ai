import { NextRequest } from 'next/server'

/**
 * Deprecated route. Submit has been removed on frontend; use /api/v1/chat/agent.
 */
export async function POST(_request: NextRequest) {
  try {
    return Response.json(
      {
        detail: 'This endpoint is removed. Use /api/v1/chat/agent.',
        code: 'ENDPOINT_REMOVED',
      },
      { status: 410 }
    )
  } catch (error) {
    console.error('Error in chat submit:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
