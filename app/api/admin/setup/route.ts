import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { sql } from '@/lib/db'

// Idempotent migration — adds admin_username column if it doesn't exist.
// Called automatically by the super admin dashboard on load.
export async function POST() {
  const session = getAdminSession()
  if (!session || session.role !== 'super') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  try {
    await sql`ALTER TABLE banks ADD COLUMN IF NOT EXISTS admin_username VARCHAR(100) UNIQUE`
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true }) // column already exists
  }
}
