import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text(); 

    const headers: HeadersInit = {
      ...(request.headers.get('content-type') && {
        'Content-Type': request.headers.get('content-type')!,
      }),
      ...(request.headers.get('cookie') && {
        Cookie: request.headers.get('cookie')!,
      }),
      ...(request.headers.get('authorization') && {
        Authorization: request.headers.get('authorization')!,
      }),
    };

    const backendRes = await fetch(
      `${process.env.API_BASE_URL}/api/v1/chat/stream`,
      {
        method: 'POST',
        headers,
        body,
        signal: request.signal,
      }
    );

    if (!backendRes.ok || !backendRes.body) {
      const text = await backendRes.text();
      return new Response(text, { status: backendRes.status });
    }

    return new Response(backendRes.body, {
      status: backendRes.status,
      headers: {
        'Content-Type':
          backendRes.headers.get('content-type') ||
          'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });

  } catch (err) {
    console.error('Stream proxy error:', err);
    return new Response('Internal server error', { status: 500 });
  }
}