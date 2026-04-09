import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sql } from '@/lib/db'

const mockSql = vi.mocked(sql)

function makeRequest(body: object): Request {
  return new Request('http://localhost/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.4' },
    body: JSON.stringify(body),
  })
}

// Helper: fresh import to reset in-memory rate limit map between tests
async function getHandler() {
  vi.resetModules()
  return (await import('@/app/api/admin/login/route')).POST
}

describe('POST /api/admin/login — super admin', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env.ADMIN_USERNAME = 'superuser'
    process.env.ADMIN_PASSWORD = 'secret123'
  })

  it('accepts correct super admin credentials', async () => {
    const POST = await getHandler()
    const res = await POST(makeRequest({ username: 'superuser', password: 'secret123' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.role).toBe('super')
    expect(body.redirectTo).toBe('/admin/dashboard')
  })

  it('is case-insensitive for super admin username', async () => {
    const POST = await getHandler()
    const res = await POST(makeRequest({ username: 'SUPERUSER', password: 'secret123' }))
    expect(res.status).toBe(200)
  })

  it('rejects wrong super admin password', async () => {
    const POST = await getHandler()
    const res = await POST(makeRequest({ username: 'superuser', password: 'wrong' }))
    expect(res.status).toBe(401)
  })

  it('rejects missing username or password', async () => {
    const POST = await getHandler()
    const res = await POST(makeRequest({ username: '', password: '' }))
    expect(res.status).toBe(400)
  })

  it('sets an httpOnly cookie on success', async () => {
    const POST = await getHandler()
    const res = await POST(makeRequest({ username: 'superuser', password: 'secret123' }))
    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toMatch(/plenti_session/)
    expect(setCookie).toMatch(/HttpOnly/)
  })
})

describe('POST /api/admin/login — bank admin', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env.ADMIN_USERNAME = 'admin'
    process.env.ADMIN_PASSWORD = 'adminpass'
  })

  it('accepts valid bank admin credentials', async () => {
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.hash('bankpass', 10)
    mockSql.mockResolvedValueOnce({ rows: [{ id: 7, admin_password_hash: hash }] } as never)

    const POST = await getHandler()
    const res = await POST(makeRequest({ username: 'foodbank1', password: 'bankpass' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.role).toBe('bank')
    expect(body.redirectTo).toBe('/admin/bank-dashboard')
  })

  it('rejects unknown bank username', async () => {
    mockSql.mockResolvedValueOnce({ rows: [] } as never)
    const POST = await getHandler()
    const res = await POST(makeRequest({ username: 'nobody', password: 'pass' }))
    expect(res.status).toBe(401)
  })

  it('rejects wrong bank password', async () => {
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.hash('correctpass', 10)
    mockSql.mockResolvedValueOnce({ rows: [{ id: 7, admin_password_hash: hash }] } as never)

    const POST = await getHandler()
    const res = await POST(makeRequest({ username: 'foodbank1', password: 'wrongpass' }))
    expect(res.status).toBe(401)
  })

  it('returns a specific message when no credentials are set', async () => {
    mockSql.mockResolvedValueOnce({ rows: [{ id: 7, admin_password_hash: null }] } as never)
    const POST = await getHandler()
    const res = await POST(makeRequest({ username: 'foodbank1', password: 'anything' }))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toMatch(/contact your super admin/i)
  })

  it('returns 500 on database error', async () => {
    mockSql.mockRejectedValueOnce(new Error('DB down') as never)
    const POST = await getHandler()
    const res = await POST(makeRequest({ username: 'foodbank1', password: 'pass' }))
    expect(res.status).toBe(500)
  })
})

describe('POST /api/admin/login — rate limiting', () => {
  beforeEach(() => {
    process.env.ADMIN_USERNAME = 'admin'
    process.env.ADMIN_PASSWORD = 'adminpass'
  })

  it('blocks after 20 failed attempts from same IP', async () => {
    // Use a unique IP so other tests don't bleed in
    const ip = '9.9.9.9'
    vi.resetModules()
    const { POST } = await import('@/app/api/admin/login/route')

    const makeReq = () => new Request('http://localhost/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify({ username: 'admin', password: 'wrong' }),
    })

    // Burn through 20 attempts
    for (let i = 0; i < 20; i++) await POST(makeReq())

    // 21st should be rate-limited
    const res = await POST(makeReq())
    expect(res.status).toBe(429)
  })
})
