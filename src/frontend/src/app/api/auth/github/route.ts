import { NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL } from '@/core'

/**
 * GET /api/auth/github - Start GitHub OAuth via backend
 */
export async function GET(request: NextRequest) {
  try {
    const backendResponse = await fetch(`${API_BASE_URL}/api/v1/auth/github`, {
      method: 'GET',
      redirect: 'manual',
    })

    const location = backendResponse.headers.get("location");
    const isRedirect =
      backendResponse.status >= 300 && backendResponse.status < 400;

    if (!isRedirect || !location) {
      return NextResponse.json(
        { error: "Failed to initiate GitHub OAuth" },
        { status: backendResponse.status || 500 },
      );
    }

    const oauthUrl = new URL(location)
    oauthUrl.searchParams.set('redirect_uri', `${request.nextUrl.origin}/api/auth/github/callback`)

    return NextResponse.redirect(oauthUrl.toString(), {
      status: backendResponse.status >= 300 && backendResponse.status < 400
        ? backendResponse.status
        : 307,
    })
  } catch (error) {
    console.error('Error starting GitHub OAuth:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
