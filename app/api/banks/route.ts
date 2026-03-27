import { NextResponse } from 'next/server'
import { getBanks, sql } from '@/lib/db'
import { DEFAULT_BANKS } from '@/lib/types'

export async function GET() {
  try {
    const banks = await getBanks()
    return NextResponse.json(banks)
  } catch {
    // DB not provisioned yet -- return seed data so app still works
    return NextResponse.json(DEFAULT_BANKS)
  }
}

export async function POST(request: Request) {
  const role = request.headers.get('x-admin-role')
  if (role !== 'super') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, location } = await request.json() as { name: string; location?: string }
  const { rows } = await sql`
    INSERT INTO banks (name, location) VALUES (${name}, ${location || 'Nearby'}) RETURNING id, name, location
  `
  return NextResponse.json({ ...rows[0], items: [] }, { status: 201 })
}
