import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const role = request.headers.get('x-admin-role')
  if (role !== 'super') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { password } = await request.json() as { password: string }
  const id = parseInt(params.id)
  const hash = await bcrypt.hash(password, 10)

  await sql`UPDATE banks SET admin_password_hash = ${hash} WHERE id = ${id}`

  return NextResponse.json({ ok: true })
}
