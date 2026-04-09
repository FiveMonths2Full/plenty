import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/headers so auth.ts can be imported in tests
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

// Mock @vercel/postgres so API routes can be imported without a real DB
vi.mock('@vercel/postgres', () => ({
  sql: vi.fn(),
}))

// Mock lib/db which wraps @vercel/postgres
vi.mock('@/lib/db', () => ({
  sql: vi.fn(),
  getBanks: vi.fn(),
}))
