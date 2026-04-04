import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function normalizeCookieForFrontendDomain(cookie: string): string {
  return cookie.replace(/;\s*domain=[^;]*/gi, '');
}

/**
 * POST /api/auth/refresh - Refresh access token using httpOnly cookie
 */
export async function POST(request: NextRequest) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json({ error: 'Missing NEXT_PUBLIC_API_URL' }, { status: 500 });
    }

    // Forward cookies from request to backend
    const cookies = request.headers.get('cookie');

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookies ? { 'Cookie': cookies } : {}),
      },
      credentials: 'include',
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : { error: await response.text() };

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Forward set-cookie headers from backend to client
    const nextResponse = NextResponse.json(data);
    const setCookieHeaders = response.headers.getSetCookie();
    setCookieHeaders.forEach(cookie => {
      nextResponse.headers.append('Set-Cookie', normalizeCookieForFrontendDomain(cookie));
    });

    return nextResponse;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
