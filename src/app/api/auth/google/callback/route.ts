import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

function normalizeCookieForFrontendDomain(cookie: string): string {
  return cookie.replace(/;\s*domain=[^;]*/gi, '')
}

/**
 * GET /api/auth/google/callback
 * Proxies OAuth callback to backend and forwards auth cookies to frontend domain.
 */
export async function GET(request: NextRequest) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json({ error: 'Missing NEXT_PUBLIC_API_URL' }, { status: 500 })
    }

    const params = new URLSearchParams(request.nextUrl.searchParams.toString())
    params.set('redirect_uri_override', `${request.nextUrl.origin}/api/auth/google/callback`)

    const backendCallbackUrl = `${API_BASE_URL}/api/v1/auth/google/callback?${params.toString()}`

    const backendResponse = await fetch(backendCallbackUrl, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    const location = backendResponse.headers.get('location')
    const fallback = `${request.nextUrl.origin}/auth/callback?success=true`
    const redirectTarget = location || fallback

    const response = NextResponse.redirect(redirectTarget, {
      status: backendResponse.status >= 300 && backendResponse.status < 400
        ? backendResponse.status
        : 307,
    })

    const setCookieHeaders = backendResponse.headers.getSetCookie()
    setCookieHeaders.forEach((cookie) => {
      response.headers.append('Set-Cookie', normalizeCookieForFrontendDomain(cookie))
    })

    return response
  } catch (error) {
    console.error('Error handling Google OAuth callback:', error)
    return NextResponse.redirect(`${request.nextUrl.origin}/auth/error?error=oauth_callback_failed`, {
      status: 307,
    })
  }
}
