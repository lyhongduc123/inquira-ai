import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * POST /api/auth/email/verify-otp
 * Verify OTP and forward auth cookies from backend.
 */
export async function POST(request: NextRequest) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json({ error: 'Missing NEXT_PUBLIC_API_URL' }, { status: 500 })
    }

    const cookies = request.headers.get('cookie')
    const body = await request.json()

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/email/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookies ? { 'Cookie': cookies } : {}),
      },
      body: JSON.stringify(body),
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    const nextResponse = NextResponse.json(data)
    const setCookieHeaders = response.headers.getSetCookie()
    setCookieHeaders.forEach((cookie) => {
      nextResponse.headers.append('Set-Cookie', cookie.replace(/;\s*domain=[^;]*/gi, ''))
    })

    return nextResponse
  } catch (error) {
    console.error('Error verifying email OTP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
