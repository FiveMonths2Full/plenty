import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const role = request.headers.get('x-admin-role')
  const bankIdHeader = request.headers.get('x-admin-bank-id')

  // Super admin or the bank's own admin
  if (role !== 'super' && bankIdHeader !== params.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name, location } = await request.json() as { name?: string; location?: string }
  const id = parseInt(params.id)

  if (name !== undefined && location !== undefined) {
    await sql`UPDATE banks SET name = ${name}, location = ${location} WHERE id = ${id}`
  } else if (name !== undefined) {
    await sql`UPDATE banks SET name = ${name} WHERE id = ${id}`
  } else if (location !== undefined) {
    await sql`UPDATE banks SET location = ${location} WHERE id = ${id}`
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const role = request.headers.get('x-admin-role')
  if (role !== 'super') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const id = parseInt(params.id)
  await sql`DELETE FROM items WHERE bank_id = ${id}`
  await sql`DELETE FROM banks WHERE id = ${id}`

  return NextResponse.json({ ok: true })
}
