import { NextRequest } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/test/stream - Test streaming endpoint (no auth required)
 * This route proxies test streaming requests to the FastAPI backend test router
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Call backend test streaming endpoint (no auth required)
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/test/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText, {
        status: response.status,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Stream the response back to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in test stream:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
