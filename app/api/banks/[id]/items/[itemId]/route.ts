import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  const role = request.headers.get('x-admin-role')
  const bankIdHeader = request.headers.get('x-admin-bank-id')

  if (role !== 'super' && bankIdHeader !== params.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json() as Record<string, unknown>
  const itemId = parseInt(params.itemId)

  if (body.priority !== undefined) {
    await sql`UPDATE items SET priority = ${body.priority as string} WHERE id = ${itemId}`
  }
  if (body.name !== undefined) {
    await sql`UPDATE items SET name = ${body.name as string} WHERE id = ${itemId}`
  }
  if (body.detail !== undefined) {
    await sql`UPDATE items SET detail = ${body.detail as string} WHERE id = ${itemId}`
  }
  if (body.qty !== undefined) {
    await sql`UPDATE items SET qty = ${body.qty as number} WHERE id = ${itemId}`
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  const role = request.headers.get('x-admin-role')
  const bankIdHeader = request.headers.get('x-admin-bank-id')

  if (role !== 'super' && bankIdHeader !== params.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const itemId = parseInt(params.itemId)
  await sql`DELETE FROM items WHERE id = ${itemId}`

  return NextResponse.json({ ok: true })
}
