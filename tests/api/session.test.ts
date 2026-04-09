import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cookies } from 'next/headers'

const mockCookies = vi.mocked(cookies)

function makeCookieStore(value?: string) {
  return {
    get: (name: string) => name === 'plenti_session' && value ? { value } : undefined,
  } as ReturnType<typeof cookies>
}

describe('GET /api/admin/session', () => {
  beforeEach(() => vi.resetModules())

  it('returns 401 when no cookie', async () => {
    mockCookies.mockReturnValue(makeCookieStore())
    const { GET } = await import('@/app/api/admin/session/route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns role and bankId for a valid super session', async () => {
    mockCookies.mockReturnValue(makeCookieStore(JSON.stringify({ role: 'super', bankId: null })))
    const { GET } = await import('@/app/api/admin/session/route')
    const res = await GET()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ role: 'super', bankId: null })
  })

  it('returns role and bankId for a valid bank session', async () => {
    mockCookies.mockReturnValue(makeCookieStore(JSON.stringify({ role: 'bank', bankId: 4 })))
    const { GET } = await import('@/app/api/admin/session/route')
    const res = await GET()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ role: 'bank', bankId: 4 })
  })

  it('returns 401 for malformed cookie JSON', async () => {
    mockCookies.mockReturnValue(makeCookieStore('not-json'))
    const { GET } = await import('@/app/api/admin/session/route')
    const res = await GET()
    expect(res.status).toBe(401)
  })
})
