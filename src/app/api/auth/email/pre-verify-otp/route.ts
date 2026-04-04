import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * POST /api/auth/email/pre-verify-otp
 * Pre-verify signup OTP without consuming it.
 */
export async function POST(request: NextRequest) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json({ error: 'Missing NEXT_PUBLIC_API_URL' }, { status: 500 })
    }

    const body = await request.json()

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/email/pre-verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error pre-verifying email OTP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
