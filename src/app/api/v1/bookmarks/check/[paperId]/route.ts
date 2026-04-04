import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/core';

/**
 * GET /api/v1/bookmarks/check/[paperId] - Check if a paper is bookmarked
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paperId: string }> }
) {
  try {
    const { paperId } = await params;
    
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

    const response = await fetch(`${API_BASE_URL}/api/v1/bookmarks/check/${paperId}`, {
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
    console.error('Error checking bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
