import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const sessionExpiry = request.cookies.get('trench_session_expiry')?.value
  const now = Date.now()

  if (sessionExpiry) {
    const expiryTime = parseInt(sessionExpiry, 10)
    if (now > expiryTime) {
      return NextResponse.redirect(new URL('/auth/login?error=sessao_expirada', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/financeiro/:path*', '/cadastros/:path*', '/prestacao/:path*', '/configuracao/:path*', '/acesso/:path*'],
}
