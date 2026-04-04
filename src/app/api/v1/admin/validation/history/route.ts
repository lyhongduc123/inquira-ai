import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/core';

/**
 * GET /api/v1/admin/validation/history - Get validation history
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const skip = searchParams.get('skip') || '0';
    const limit = searchParams.get('limit') || '50';
    const messageId = searchParams.get('message_id');
    const modelName = searchParams.get('model_name');
    const hasHallucination = searchParams.get('has_hallucination');

    const params = new URLSearchParams({
      skip,
      limit,
    });

    if (messageId) params.append('message_id', messageId);
    if (modelName) params.append('model_name', modelName);
    if (hasHallucination !== null) params.append('has_hallucination', hasHallucination);

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
      `${API_BASE_URL}/api/v1/admin/validation/history?${params}`,
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
    console.error('Error fetching validation history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
