import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadSelected, saveSelected,
  loadDonated, saveDonated,
  loadActiveBank, saveActiveBank,
  loadBanksCache, saveBanksCache,
} from '@/lib/storage'
import type { Bank } from '@/lib/types'

const makeBank = (id: number): Bank => ({ id, name: `Bank ${id}`, location: 'Here', items: [] })

beforeEach(() => localStorage.clear())

describe('selected map', () => {
  it('returns empty object when nothing stored', () => {
    expect(loadSelected()).toEqual({})
  })

  it('round-trips a selected map', () => {
    saveSelected({ 1: { 2: 1 } })
    expect(loadSelected()).toEqual({ 1: { 2: 1 } })
  })
})

describe('donated map', () => {
  it('returns empty object when nothing stored', () => {
    expect(loadDonated()).toEqual({})
  })

  it('round-trips a donated map', () => {
    saveDonated({ 1: { 3: true } })
    expect(loadDonated()).toEqual({ 1: { 3: true } })
  })
})

describe('loadActiveBank', () => {
  it('returns first bank id when nothing is stored', () => {
    expect(loadActiveBank([makeBank(10), makeBank(20)])).toBe(10)
  })

  it('returns stored id when it exists in the banks list', () => {
    saveActiveBank(20)
    expect(loadActiveBank([makeBank(10), makeBank(20)])).toBe(20)
  })

  it('falls back to first bank when stored id is not in the list', () => {
    saveActiveBank(99)
    expect(loadActiveBank([makeBank(1), makeBank(2)])).toBe(1)
  })

  it('returns 1 (not a crash) when banks array is empty', () => {
    expect(loadActiveBank([])).toBe(1)
  })
})

describe('banks cache', () => {
  it('returns null when no cache exists', () => {
    expect(loadBanksCache()).toBeNull()
  })

  it('round-trips a banks cache', () => {
    const banks = [makeBank(1), makeBank(2)]
    saveBanksCache(banks)
    expect(loadBanksCache()).toEqual(banks)
  })
})
