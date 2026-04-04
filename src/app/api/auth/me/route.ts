import { normalizeCookieForFrontendDomain } from '@/lib/utils/cookie';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/auth/me - Get current user info
 */
export async function GET(request: NextRequest) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json({ error: 'Missing NEXT_PUBLIC_API_URL' }, { status: 500 });
    }

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

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers,
      credentials: 'include',
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : { error: await response.text() };

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Forward set-cookie headers from backend to client (if any)
    const nextResponse = NextResponse.json(data);
    const setCookieHeaders = response.headers.getSetCookie();
    setCookieHeaders.forEach(cookie => {
      nextResponse.headers.append('Set-Cookie', normalizeCookieForFrontendDomain(cookie));
    });

    return nextResponse;
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
