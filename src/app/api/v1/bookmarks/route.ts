import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/core';

/**
 * GET /api/v1/bookmarks - List all bookmarks for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const skip = searchParams.get('skip') || '0';
    const limit = searchParams.get('limit') || '50';

    const params = new URLSearchParams({
      skip,
      limit,
    });

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

    const response = await fetch(`${API_BASE_URL}/api/v1/bookmarks?${params}`, {
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      // Backend returns ApiResponse with error field
      return NextResponse.json(
        data,
        { status: response.status }
      );
    }

    // Pass through the ApiResponse structure
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/bookmarks - Create a new bookmark
 */
export async function POST(request: NextRequest) {
  try {
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

    const response = await fetch(`${API_BASE_URL}/api/v1/bookmarks`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      // Backend returns ApiResponse with error field
      return NextResponse.json(
        data,
        { status: response.status }
      );
    }

    // Pass through the ApiResponse structure
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
