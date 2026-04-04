import { NextRequest } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/v1/chat/stream/paper/[paper_id] - Stream chat responses for a specific paper
 * This route proxies streaming requests to the FastAPI backend for paper-specific conversations
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ paper_id: string }> }
) {
  try {
    const { paper_id } = await params;
    const body = await request.json();
    
    // Forward cookies from request to backend
    const cookies = request.headers.get('cookie');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(cookies ? { 'Cookie': cookies } : {}),
    };

    // Keep Authorization header for backward compatibility
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Call backend streaming endpoint for specific paper
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/stream/paper/${paper_id}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText, {
        status: response.status,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Stream the response back to the client
    // This maintains the SSE (Server-Sent Events) format from the backend
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Error in paper chat stream:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
