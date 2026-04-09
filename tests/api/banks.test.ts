import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getBanks } from '@/lib/db'
import { cookies } from 'next/headers'

const mockGetBanks = vi.mocked(getBanks)
const mockCookies = vi.mocked(cookies)

function superCookies() {
  return {
    get: (name: string) => name === 'plenti_session'
      ? { value: JSON.stringify({ role: 'super', bankId: null }) }
      : undefined,
  } as ReturnType<typeof cookies>
}

describe('GET /api/banks', () => {
  beforeEach(() => vi.resetModules())

  it('returns banks from the database', async () => {
    const fakeBank = { id: 1, name: 'Food Bank A', location: 'City', items: [] }
    mockGetBanks.mockResolvedValueOnce([fakeBank] as never)
    const { GET } = await import('@/app/api/banks/route')
    const res = await GET()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([fakeBank])
  })

  it('returns [] (not DEFAULT_BANKS) when the database throws', async () => {
    mockGetBanks.mockRejectedValueOnce(new Error('DB down') as never)
    const { GET } = await import('@/app/api/banks/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
    expect(body).toHaveLength(0)
  })
})

describe('POST /api/banks', () => {
  beforeEach(() => vi.resetModules())

  it('rejects unauthenticated requests', async () => {
    mockCookies.mockReturnValue({ get: () => undefined } as ReturnType<typeof cookies>)
    const { POST } = await import('@/app/api/banks/route')
    const req = new Request('http://localhost/api/banks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Bank' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('rejects bank-role users', async () => {
    mockCookies.mockReturnValue({
      get: (name: string) => name === 'plenti_session'
        ? { value: JSON.stringify({ role: 'bank', bankId: 1 }) }
        : undefined,
    } as ReturnType<typeof cookies>)
    const { POST } = await import('@/app/api/banks/route')
    const req = new Request('http://localhost/api/banks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Bank' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })
})
