import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/core';

/**
 * GET /api/v1/papers/[paper_id]/citations - Get paper citations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paper_id: string }> }
) {
  try {
    const { paper_id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('page_size') || '20';
    const sortBy = searchParams.get('sort_by');
    const order = searchParams.get('order');

    const queryParams = new URLSearchParams({
      page,
      page_size: pageSize,
    });

    if (sortBy) queryParams.append('sort_by', sortBy);
    if (order) queryParams.append('order', order);

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

    const response = await fetch(
      `${API_BASE_URL}/api/v1/papers/${paper_id}/citations?${queryParams}`,
      {
        headers,
        credentials: 'include',
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching citations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
