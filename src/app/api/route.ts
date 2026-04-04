import { NextRequest } from 'next/server';
import { API_BASE_URL } from '@/core';

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    // "Authorization": req.headers.get("Authorization") || "",
  };
  
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/test/stream`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, stream: true }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Backend error: ${res.status} - ${errorText}`);
      return new Response(JSON.stringify({ error: `Backend returned ${res.status}` }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!res.body) {
      return new Response(JSON.stringify({ error: 'No response body from backend' }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return the stream directly with proper headers
    return new Response(res.body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error('Error calling backend:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to connect to backend',
        details: error instanceof Error ? error.message : String(error)
      }), 
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
