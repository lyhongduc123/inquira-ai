import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/core';

/**
 * GET /api/v1/authors/[author_id] - Get an author
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ author_id: string }> },
) {
  try {
    const { author_id } = await params;

    // Forward cookies from request to backend
    const cookies = request.headers.get('cookie');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(cookies ? { Cookie: cookies } : {}),
    };

    // Keep Authorization header for backward compatibility
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/authors/${author_id}`, {
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching author:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
