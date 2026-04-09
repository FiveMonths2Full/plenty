import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('POST /api/admin/logout', () => {
  beforeEach(() => vi.resetModules())

  it('returns 200 ok', async () => {
    const { POST } = await import('@/app/api/admin/logout/route')
    const res = await POST()
    expect(res.status).toBe(200)
  })

  it('clears the plenti_session cookie with maxAge 0', async () => {
    const { POST } = await import('@/app/api/admin/logout/route')
    const res = await POST()
    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toMatch(/plenti_session/)
    expect(setCookie).toMatch(/Max-Age=0/)
  })

  it('sets httpOnly on the clearing cookie', async () => {
    const { POST } = await import('@/app/api/admin/logout/route')
    const res = await POST()
    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toMatch(/HttpOnly/)
  })
})
