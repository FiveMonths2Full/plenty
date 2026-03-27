// lib/storage.ts
import { Bank, SelectedMap, DonatedMap } from './types'

const KEYS = {
  selected:   'plenty_list_v2',
  donated:    'plenty_done_v2',
  activeBank: 'plenty_active_bank',
}

const CACHE_KEY = 'plenty_banks_cache'

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export function loadSelected(): SelectedMap {
  return read<SelectedMap>(KEYS.selected, {})
}

export function saveSelected(map: SelectedMap) {
  write(KEYS.selected, map)
}

export function loadDonated(): DonatedMap {
  return read<DonatedMap>(KEYS.donated, {})
}

export function saveDonated(map: DonatedMap) {
  write(KEYS.donated, map)
}

export function loadActiveBank(banks: Bank[]): number {
  const stored = read<number | null>(KEYS.activeBank, null)
  if (stored && banks.find(b => b.id === stored)) return stored
  return banks[0]?.id ?? 1
}

export function saveActiveBank(id: number) {
  write(KEYS.activeBank, id)
}

export function loadBanksCache(): Bank[] | null {
  return read<Bank[] | null>(CACHE_KEY, null)
}

export function saveBanksCache(banks: Bank[]): void {
  write(CACHE_KEY, banks)
}
