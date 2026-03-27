'use client'
// components/BankSelector.tsx
import { useStore } from '@/lib/store'

export default function BankSelector() {
  const { banks, activeBankId, setActiveBankId } = useStore()

  return (
    <div style={{ position: 'relative', marginTop: 10 }}>
      <select
        value={activeBankId}
        onChange={e => setActiveBankId(Number(e.target.value))}
        style={{
          width: '100%', appearance: 'none',
          fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
          padding: '9px 32px 9px 12px',
          border: '0.5px solid #ddd', borderRadius: 10,
          background: '#f8f8f6', color: '#111', cursor: 'pointer',
        }}
      >
        {banks.map(b => (
          <option key={b.id} value={b.id}>
            {b.name} · {b.location}
          </option>
        ))}
      </select>
      <span style={{
        position: 'absolute', right: 12, top: '50%',
        transform: 'translateY(-50%)', fontSize: 11,
        color: '#888', pointerEvents: 'none',
      }}>▾</span>
    </div>
  )
}
