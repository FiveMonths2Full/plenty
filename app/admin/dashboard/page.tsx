'use client'
// app/admin/dashboard/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { Item } from '@/lib/types'
import { EmptyState, Toast } from '@/components/ui'

interface SessionInfo {
  role: 'super' | 'bank'
  bankId: number | null
}

export default function AdminDashboard() {
  const router = useRouter()
  const {
    banks, addBank, updateBank, deleteBank,
    addItem, updateItemPriority, deleteItem,
  } = useStore()

  const [activeBankId, setActiveBankId] = useState<number | null>(null)
  const [toast, setToast] = useState({ visible: false, message: '' })
  const [session, setSession] = useState<SessionInfo | null>(null)

  // New item form state
  const [niName,     setNiName]     = useState('')
  const [niDetail,   setNiDetail]   = useState('')
  const [niQty,      setNiQty]      = useState('')
  const [niPriority, setNiPriority] = useState<Item['priority']>('medium')

  // Edit bank state
  const [ebName, setEbName] = useState('')
  const [ebLoc,  setEbLoc]  = useState('')

  // Fetch session on mount
  useEffect(() => {
    fetch('/api/admin/session')
      .then(r => {
        if (!r.ok) throw new Error('Not authenticated')
        return r.json()
      })
      .then((data: SessionInfo) => setSession(data))
      .catch(() => router.replace('/admin'))
  }, [router])

  // Filter banks for bank-role admins
  const visibleBanks = session?.role === 'bank' && session.bankId
    ? banks.filter(b => b.id === session.bankId)
    : banks

  useEffect(() => {
    if (!activeBankId && visibleBanks.length > 0) {
      setActiveBankId(visibleBanks[0].id)
    }
  }, [visibleBanks, activeBankId])

  useEffect(() => {
    const bank = banks.find(b => b.id === activeBankId)
    if (bank) { setEbName(bank.name); setEbLoc(bank.location) }
  }, [activeBankId, banks])

  const showToast = (message: string) => {
    setToast({ visible: true, message })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }

  const activeBank = banks.find(b => b.id === activeBankId)
  const isSuper = session?.role === 'super'

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  function handleAddBank() {
    const name = prompt('Food bank name:')?.trim()
    if (!name) return
    const location = prompt('Location (e.g. 1.2 mi):')?.trim() || 'Nearby'
    addBank(name, location)
    showToast(`${name} added`)
  }

  function handleDeleteBank(id: number) {
    if (banks.length <= 1) { alert('You must keep at least one food bank.'); return }
    if (!confirm('Delete this food bank and all its items?')) return
    const fallback = visibleBanks.find(b => b.id !== id)
    deleteBank(id)
    setActiveBankId(fallback?.id ?? null)
    showToast('Food bank deleted')
  }

  function handleSaveBank() {
    if (!activeBankId || !ebName.trim()) return
    updateBank(activeBankId, ebName.trim(), ebLoc.trim() || 'Nearby')
    showToast('Saved')
  }

  function handleAddItem() {
    if (!activeBankId || !niName.trim()) return
    addItem(activeBankId, {
      name: niName.trim(),
      detail: niDetail.trim(),
      qty: parseInt(niQty) || 0,
      priority: niPriority,
    })
    setNiName(''); setNiDetail(''); setNiQty(''); setNiPriority('medium')
    showToast('Item added')
  }

  function handleCopyShareLink(id: number) {
    const url = `${window.location.origin}/?bank=${id}`
    navigator.clipboard?.writeText(url).catch(() => {})
    showToast('Share link copied')
  }

  const sortedItems = activeBank
    ? [...activeBank.items].sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]))
    : []

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', paddingBottom: 60 }}>
      {/* Top bar */}
      <header style={{
        padding: '18px 20px', borderBottom: '0.5px solid #eee',
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, background: '#fff', zIndex: 10,
      }}>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 400 }}>Plenty</span>
        <span style={{
          fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
          background: '#f5f5f3', border: '0.5px solid #e8e8e8', color: '#aaa',
          padding: '3px 9px', borderRadius: 999,
        }}>Admin</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/" style={{ fontSize: 13, color: '#888', textDecoration: 'underline' }}>&larr; User view</a>
          <button
            onClick={handleLogout}
            style={{ fontSize: 13, color: '#888', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Sign out
          </button>
        </div>
      </header>

      <div style={{ padding: 20 }}>

        {/* -- Food banks -- */}
        <section style={{ marginBottom: 28 }}>
          <div style={sectionHead}>Food banks</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {visibleBanks.map(b => (
              <button
                key={b.id}
                onClick={() => setActiveBankId(b.id)}
                style={{
                  padding: '7px 14px', borderRadius: 999,
                  border: `0.5px solid ${b.id === activeBankId ? '#111' : '#ddd'}`,
                  background: b.id === activeBankId ? '#111' : 'transparent',
                  color: b.id === activeBankId ? '#fff' : '#888',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {b.name}
              </button>
            ))}
            {isSuper && (
              <button onClick={handleAddBank} style={{
                padding: '7px 14px', borderRadius: 999,
                border: '0.5px dashed #ccc', background: 'transparent',
                fontSize: 13, color: '#aaa', cursor: 'pointer',
              }}>
                + Add bank
              </button>
            )}
          </div>

          {/* Edit selected bank */}
          {activeBank && (
            <div style={card}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input className="fi" value={ebName} onChange={e => setEbName(e.target.value)}
                  placeholder="Bank name" style={{ ...fi, flex: 2, minWidth: 140 }} />
                <input className="fi" value={ebLoc} onChange={e => setEbLoc(e.target.value)}
                  placeholder="Location" style={{ ...fi, flex: 1, minWidth: 100 }} />
                <button onClick={handleSaveBank} style={btnPrimary}>Save</button>
                <button onClick={() => handleCopyShareLink(activeBank.id)} style={btnOutline}>Copy share link</button>
                {isSuper && (
                  <button onClick={() => handleDeleteBank(activeBank.id)} style={btnDanger}>Delete bank</button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* -- Items -- */}
        <section>
          <div style={sectionHead}>
            Items
            {activeBank && <span style={{ fontWeight: 400, fontStyle: 'italic', textTransform: 'none', letterSpacing: 0, marginLeft: 6, color: '#aaa' }}>
              &mdash; {activeBank.name}
            </span>}
          </div>

          {sortedItems.length === 0 ? (
            <EmptyState icon="&#x1f4cb;" label="No items yet" sub="Add items below to show donors what's needed." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
              {sortedItems.map(item => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', background: '#fff',
                  border: '0.5px solid #e8e8e8', borderRadius: 10,
                  flexWrap: 'wrap',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>
                      {item.detail}{item.qty ? ` \u00B7 ${item.qty} needed` : ''}
                    </div>
                  </div>
                  <select
                    value={item.priority}
                    onChange={e => activeBankId && updateItemPriority(activeBankId, item.id, e.target.value as Item['priority'])}
                    style={{ ...fi, fontSize: 12, padding: '5px 8px', width: 'auto' }}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <button
                    onClick={() => activeBankId && deleteItem(activeBankId, item.id)}
                    style={{ ...btnDanger, fontSize: 12, padding: '5px 10px' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add item form */}
          {activeBank && (
            <div style={card}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                <input value={niName} onChange={e => setNiName(e.target.value)}
                  placeholder="Item name" style={{ ...fi, flex: 2, minWidth: 140 }} />
                <input value={niDetail} onChange={e => setNiDetail(e.target.value)}
                  placeholder="Hint (e.g. any brand)" style={{ ...fi, flex: 2, minWidth: 140 }} />
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input value={niQty} onChange={e => setNiQty(e.target.value)}
                  type="number" min={1} placeholder="Qty needed"
                  style={{ ...fi, width: 110 }} />
                <select value={niPriority} onChange={e => setNiPriority(e.target.value as Item['priority'])}
                  style={{ ...fi, width: 'auto' }}>
                  <option value="high">High need</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <button onClick={handleAddItem} style={btnPrimary}>Add item</button>
              </div>
            </div>
          )}
        </section>
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </main>
  )
}

// -- Styles --
const sectionHead: React.CSSProperties = {
  fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: '#aaa', marginBottom: 10,
}
const card: React.CSSProperties = {
  background: '#f8f8f6', border: '0.5px solid #e8e8e8',
  borderRadius: 12, padding: 14,
}
const fi: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 13, padding: '9px 12px',
  border: '0.5px solid #ddd', borderRadius: 10,
  background: '#fff', color: '#111', outline: 'none',
}
const btnPrimary: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
  padding: '9px 16px', borderRadius: 10,
  background: '#27500A', color: '#fff', border: 'none', cursor: 'pointer',
  whiteSpace: 'nowrap',
}
const btnOutline: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
  padding: '9px 14px', borderRadius: 10,
  background: 'transparent', color: '#3B6D11',
  border: '0.5px solid #C0DD97', cursor: 'pointer',
  whiteSpace: 'nowrap',
}
const btnDanger: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
  padding: '9px 14px', borderRadius: 10,
  background: 'transparent', color: '#993C1D',
  border: '0.5px solid #F5C4B3', cursor: 'pointer',
  whiteSpace: 'nowrap',
}
