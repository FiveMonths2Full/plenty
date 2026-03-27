import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    const session = request.cookies.get('plenty_session')
    if (!session) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    // Pass role info to the route via headers
    const response = NextResponse.next()
    try {
      const data = JSON.parse(session.value) as { role?: string; bankId?: number | null }
      response.headers.set('x-admin-role', data.role || 'super')
      response.headers.set('x-admin-bank-id', String(data.bankId || ''))
    } catch {
      // invalid session cookie
    }
    return response
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/dashboard', '/admin/dashboard/:path*']
}
