import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()
  const session = cookieStore.get('plenty_session')

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const data = JSON.parse(session.value) as { role: string; bankId: number | null }
    return NextResponse.json({ role: data.role, bankId: data.bankId })
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }
}
