import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * GET /api/auth/github - Start GitHub OAuth via backend
 */
export async function GET(request: NextRequest) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json({ error: 'Missing NEXT_PUBLIC_API_URL' }, { status: 500 })
    }

    const backendResponse = await fetch(`${API_BASE_URL}/api/v1/auth/github`, {
      method: 'GET',
      redirect: 'manual',
    })

    const location = backendResponse.headers.get('location')
    if (!location) {
      return NextResponse.json({ error: 'OAuth redirect URL not found' }, { status: 500 })
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
