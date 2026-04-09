import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = getAdminSession()
  if (!session || session.role !== 'super') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { username, password } = await request.json() as { username?: string; password?: string }
  try {
    const { sql } = await import('@vercel/postgres')
    const bcrypt = await import('bcryptjs')
    const bankId = parseInt(params.id)

    if (username !== undefined) {
      const trimmed = username.trim()
      if (!trimmed) return NextResponse.json({ error: 'Username cannot be empty.' }, { status: 400 })
      await sql`UPDATE banks SET admin_username = ${trimmed} WHERE id = ${bankId}`
    }

    if (password !== undefined) {
      if (!password.trim()) return NextResponse.json({ error: 'Password cannot be empty.' }, { status: 400 })
      const hash = await bcrypt.hash(password, 10)
      await sql`UPDATE banks SET admin_password_hash = ${hash} WHERE id = ${bankId}`
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('set-credentials error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
