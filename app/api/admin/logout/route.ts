import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  const isProduction = process.env.NODE_ENV === 'production'
  // Attributes must match the login cookie exactly so the browser removes it
  response.cookies.set('plenti_session', '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
  })
  return response
}
