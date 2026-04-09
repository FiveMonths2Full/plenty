import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cookies } from 'next/headers'

const mockCookies = vi.mocked(cookies)

describe('getAdminSession', () => {
  beforeEach(() => vi.resetAllMocks())

  it('returns null when cookie is missing', async () => {
    mockCookies.mockReturnValue({ get: () => undefined } as ReturnType<typeof cookies>)
    const { getAdminSession } = await import('@/lib/auth')
    expect(getAdminSession()).toBeNull()
  })

  it('parses a valid super session', async () => {
    mockCookies.mockReturnValue({
      get: () => ({ value: JSON.stringify({ role: 'super', bankId: null }) }),
    } as ReturnType<typeof cookies>)
    const { getAdminSession } = await import('@/lib/auth')
    expect(getAdminSession()).toEqual({ role: 'super', bankId: null })
  })

  it('parses a valid bank session', async () => {
    mockCookies.mockReturnValue({
      get: () => ({ value: JSON.stringify({ role: 'bank', bankId: 7 }) }),
    } as ReturnType<typeof cookies>)
    const { getAdminSession } = await import('@/lib/auth')
    expect(getAdminSession()).toEqual({ role: 'bank', bankId: 7 })
  })

  it('returns null for malformed JSON', async () => {
    mockCookies.mockReturnValue({
      get: () => ({ value: 'not-json' }),
    } as ReturnType<typeof cookies>)
    const { getAdminSession } = await import('@/lib/auth')
    expect(getAdminSession()).toBeNull()
  })
})

describe('canEditBank', () => {
  it('allows super admin to edit any bank', async () => {
    const { canEditBank } = await import('@/lib/auth')
    expect(canEditBank({ role: 'super', bankId: null }, '42')).toBe(true)
    expect(canEditBank({ role: 'super', bankId: null }, '1')).toBe(true)
  })

  it('allows bank admin to edit their own bank', async () => {
    const { canEditBank } = await import('@/lib/auth')
    expect(canEditBank({ role: 'bank', bankId: 5 }, '5')).toBe(true)
  })

  it('blocks bank admin from editing another bank', async () => {
    const { canEditBank } = await import('@/lib/auth')
    expect(canEditBank({ role: 'bank', bankId: 5 }, '99')).toBe(false)
  })

  it('handles string vs number bankId coercion', async () => {
    const { canEditBank } = await import('@/lib/auth')
    expect(canEditBank({ role: 'bank', bankId: 3 }, '3')).toBe(true)
  })
})
