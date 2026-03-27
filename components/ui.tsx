'use client'
// components/ui.tsx
import React from 'react'
import { Item } from '@/lib/types'

// ── Priority badge ──────────────────────────────────────────
const BADGE_STYLES: Record<Item['priority'], React.CSSProperties> = {
  high:   { background: '#FAECE7', color: '#993C1D' },
  medium: { background: '#FAEEDA', color: '#854F0B' },
  low:    { background: '#EAF3DE', color: '#3B6D11' },
}
const BADGE_LABELS: Record<Item['priority'], string> = {
  high: 'High need', medium: 'Medium', low: 'Low',
}

export function PriorityBadge({ priority }: { priority: Item['priority'] }) {
  return (
    <span style={{
      ...BADGE_STYLES[priority],
      fontSize: 11, fontWeight: 500,
      padding: '3px 8px', borderRadius: 999,
      flexShrink: 0, whiteSpace: 'nowrap',
    }}>
      {BADGE_LABELS[priority]}
    </span>
  )
}

// ── Check circle ────────────────────────────────────────────
export function CheckCircle({ checked, size = 22 }: { checked: boolean; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      border: checked ? 'none' : '1.5px solid #ccc',
      background: checked ? '#3B6D11' : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.15s, border 0.15s',
    }}>
      {checked && (
        <svg width={size * 0.45} height={size * 0.36} viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  )
}

// ── Spinner ─────────────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px 0', gap: 10, color: '#888', fontSize: 13,
    }}>
      <div style={{
        width: 16, height: 16, borderRadius: '50%',
        border: '2px solid #e0e0e0', borderTopColor: '#3B6D11',
        animation: 'spin 0.7s linear infinite',
      }} />
      Loading…
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// ── Empty state ──────────────────────────────────────────────
export function EmptyState({ icon, label, sub }: { icon: string; label: string; sub: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '48px 20px', gap: 10,
      animation: 'fadeUp 0.25s ease',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: '#f5f5f5', border: '0.5px solid #e8e8e8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
      }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 1.5 }}>{sub}</div>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:none } }`}</style>
    </div>
  )
}

// ── Toast ────────────────────────────────────────────────────
export function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
      background: '#111', color: '#fff', fontSize: 13,
      padding: '8px 18px', borderRadius: 999,
      opacity: visible ? 1 : 0, transition: 'opacity 0.3s',
      pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 999,
    }}>
      {message}
    </div>
  )
}
