import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/core';

/**
 * GET /api/v1/user/settings - Get current user settings
 */
export async function GET(request: NextRequest) {
  try {
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

    const response = await fetch(`${API_BASE_URL}/api/v1/user/settings`, {
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
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/user/settings - Update user settings
 */
export async function PATCH(request: NextRequest) {
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

    const response = await fetch(`${API_BASE_URL}/api/v1/user/settings`, {
      method: 'PATCH',
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
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
