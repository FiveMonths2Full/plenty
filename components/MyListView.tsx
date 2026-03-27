'use client'
// components/MyListView.tsx
import { useStore } from '@/lib/store'
import { CheckCircle, EmptyState } from './ui'

interface Props {
  onShare: () => void
}

export default function MyListView({ onShare }: Props) {
  const { banks, activeBankId, selected, donated, toggleDonated, clearList } = useStore()
  const bank = banks.find(b => b.id === activeBankId)
  const key = String(activeBankId)
  const sel = selected[key] || {}
  const don = donated[key] || {}

  const selectedItems = (bank?.items || []).filter(i => sel[i.id])
  const allDonated = selectedItems.length > 0 && selectedItems.every(i => don[i.id])

  if (selectedItems.length === 0) {
    return (
      <div style={{ padding: '0 16px' }}>
        <EmptyState
          icon="🛒"
          label="Your list is empty"
          sub="Tap items on the needs list to add them here."
        />
      </div>
    )
  }

  return (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* List box */}
      <div style={{
        background: '#f8f8f6', border: '0.5px solid #e8e8e8',
        borderRadius: 14, padding: 16,
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={clearList}
            style={{ fontSize: 12, color: '#888', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
          >
            clear all
          </button>
        </div>

        {selectedItems.map(item => (
          <div
            key={item.id}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}
          >
            <div onClick={() => toggleDonated(item.id)} style={{ cursor: 'pointer' }}>
              <CheckCircle checked={!!don[item.id]} size={20} />
            </div>
            <span style={{
              flex: 1, fontSize: 14,
              textDecoration: don[item.id] ? 'line-through' : 'none',
              color: don[item.id] ? '#aaa' : '#111',
              transition: 'color 0.15s',
            }}>
              {item.name}
            </span>
            <span style={{ fontSize: 12, color: '#aaa', flexShrink: 0 }}>
              ×{sel[item.id] || 1}
            </span>
          </div>
        ))}
      </div>

      {/* Confirmation banner */}
      {allDonated && (
        <div style={{
          background: '#EAF3DE', border: '0.5px solid #C0DD97',
          borderRadius: 14, padding: 16, textAlign: 'center',
          animation: 'fadeUp 0.3s ease',
        }}>
          <p style={{ fontSize: 15, fontWeight: 500, color: '#27500A' }}>
            Nice — you helped your local community today.
          </p>
          <p style={{ fontSize: 13, color: '#3B6D11', marginTop: 4 }}>
            Every item makes a difference.
          </p>
        </div>
      )}

      {/* Share button */}
      <button
        onClick={onShare}
        style={{
          width: '100%', padding: 12,
          border: '0.5px solid #C0DD97', borderRadius: 10,
          background: 'transparent', color: '#3B6D11',
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
          transition: 'background 0.15s',
        }}
      >
        Share this food bank's needs
      </button>

      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:none } }`}</style>
    </div>
  )
}
