import { NextRequest, NextResponse } from 'next/server';
import { normalizeCookieForFrontendDomain } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/auth/logout - Logout and revoke refresh token from httpOnly cookie
 */
export async function POST(request: NextRequest) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json({ error: 'Missing NEXT_PUBLIC_API_URL' }, { status: 500 });
    }

    // Forward cookies and authorization from request to backend
    const cookies = request.headers.get('cookie');
    const authorization = request.headers.get('Authorization');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(authorization ? { 'Authorization': authorization } : {}),
      ...(cookies ? { 'Cookie': cookies } : {}),
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
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

    // Forward set-cookie headers (cookie deletion) from backend to client
    const nextResponse = NextResponse.json(data);
    const setCookieHeaders = response.headers.getSetCookie();
    setCookieHeaders.forEach(cookie => {
      nextResponse.headers.append('Set-Cookie', normalizeCookieForFrontendDomain(cookie));
    });

    return nextResponse;
  } catch (error) {
    console.error('Error logging out:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
