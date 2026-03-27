'use client'
// lib/store.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Bank, Item, SelectedMap, DonatedMap } from './types'
import {
  loadBanks, saveBanks,
  loadSelected, saveSelected,
  loadDonated, saveDonated,
  loadActiveBank, saveActiveBank,
} from './storage'

interface StoreCtx {
  banks: Bank[]
  activeBankId: number
  selected: SelectedMap
  donated: DonatedMap
  ready: boolean

  setActiveBankId: (id: number) => void

  // user actions
  toggleItem: (itemId: number) => void
  changeQty:  (itemId: number, delta: number) => void
  toggleDonated: (itemId: number) => void
  clearList: () => void

  // admin actions
  addBank:    (name: string, location: string) => void
  updateBank: (id: number, name: string, location: string) => void
  deleteBank: (id: number) => void
  addItem:    (bankId: number, item: Omit<Item, 'id'>) => void
  updateItemPriority: (bankId: number, itemId: number, priority: Item['priority']) => void
  deleteItem: (bankId: number, itemId: number) => void
}

const Ctx = createContext<StoreCtx | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready,      setReady]      = useState(false)
  const [banks,      setBanks]      = useState<Bank[]>([])
  const [activeBankId, setActiveBankIdState] = useState<number>(1)
  const [selected,   setSelected]   = useState<SelectedMap>({})
  const [donated,    setDonated]    = useState<DonatedMap>({})
  const [nextItemId, setNextItemId] = useState(300)

  useEffect(() => {
    const b = loadBanks()
    const ab = loadActiveBank(b)
    const maxId = Math.max(0, ...b.flatMap(bk => bk.items.map(i => i.id)))
    setBanks(b)
    setActiveBankIdState(ab)
    setSelected(loadSelected())
    setDonated(loadDonated())
    setNextItemId(maxId + 1)
    setReady(true)
  }, [])

  const setActiveBankId = useCallback((id: number) => {
    setActiveBankIdState(id)
    saveActiveBank(id)
  }, [])

  const toggleItem = useCallback((itemId: number) => {
    setSelected(prev => {
      const key = String(activeBankId)
      const cur = { ...(prev[key] || {}) }
      if (cur[itemId]) {
        delete cur[itemId]
        setDonated(d => {
          const nd = { ...d, [key]: { ...(d[key] || {}) } }
          delete nd[key][itemId]
          saveDonated(nd)
          return nd
        })
      } else {
        cur[itemId] = 1
      }
      const next = { ...prev, [key]: cur }
      saveSelected(next)
      return next
    })
  }, [activeBankId])

  const changeQty = useCallback((itemId: number, delta: number) => {
    setSelected(prev => {
      const key = String(activeBankId)
      const cur = prev[key]?.[itemId] ?? 1
      const next = { ...prev, [key]: { ...(prev[key] || {}), [itemId]: Math.max(1, cur + delta) } }
      saveSelected(next)
      return next
    })
  }, [activeBankId])

  const toggleDonated = useCallback((itemId: number) => {
    setDonated(prev => {
      const key = String(activeBankId)
      const next = { ...prev, [key]: { ...(prev[key] || {}), [itemId]: !prev[key]?.[itemId] } }
      saveDonated(next)
      return next
    })
  }, [activeBankId])

  const clearList = useCallback(() => {
    const key = String(activeBankId)
    setSelected(prev => { const n = { ...prev, [key]: {} }; saveSelected(n); return n })
    setDonated(prev  => { const n = { ...prev, [key]: {} }; saveDonated(n);  return n })
  }, [activeBankId])

  const addBank = useCallback((name: string, location: string) => {
    setBanks(prev => {
      const maxId = Math.max(0, ...prev.map(b => b.id))
      const next = [...prev, { id: maxId + 1, name, location, items: [] }]
      saveBanks(next)
      return next
    })
  }, [])

  const updateBank = useCallback((id: number, name: string, location: string) => {
    setBanks(prev => {
      const next = prev.map(b => b.id === id ? { ...b, name, location } : b)
      saveBanks(next)
      return next
    })
  }, [])

  const deleteBank = useCallback((id: number) => {
    setBanks(prev => {
      const next = prev.filter(b => b.id !== id)
      saveBanks(next)
      return next
    })
  }, [])

  const addItem = useCallback((bankId: number, item: Omit<Item, 'id'>) => {
    const id = nextItemId
    setNextItemId(n => n + 1)
    setBanks(prev => {
      const next = prev.map(b => b.id === bankId ? { ...b, items: [...b.items, { ...item, id }] } : b)
      saveBanks(next)
      return next
    })
  }, [nextItemId])

  const updateItemPriority = useCallback((bankId: number, itemId: number, priority: Item['priority']) => {
    setBanks(prev => {
      const next = prev.map(b => b.id !== bankId ? b : {
        ...b, items: b.items.map(i => i.id === itemId ? { ...i, priority } : i)
      })
      saveBanks(next)
      return next
    })
  }, [])

  const deleteItem = useCallback((bankId: number, itemId: number) => {
    setBanks(prev => {
      const next = prev.map(b => b.id !== bankId ? b : { ...b, items: b.items.filter(i => i.id !== itemId) })
      saveBanks(next)
      return next
    })
    const key = String(bankId)
    setSelected(prev => {
      const n = { ...prev, [key]: { ...(prev[key] || {}) } }
      delete n[key][itemId]
      saveSelected(n)
      return n
    })
    setDonated(prev => {
      const n = { ...prev, [key]: { ...(prev[key] || {}) } }
      delete n[key][itemId]
      saveDonated(n)
      return n
    })
  }, [])

  return (
    <Ctx.Provider value={{
      banks, activeBankId, selected, donated, ready,
      setActiveBankId,
      toggleItem, changeQty, toggleDonated, clearList,
      addBank, updateBank, deleteBank, addItem, updateItemPriority, deleteItem,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be inside StoreProvider')
  return ctx
}
