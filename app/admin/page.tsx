'use client'
// app/admin/page.tsx
import { useState, useEffect, useRef } from 'react'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [pw, setPw]             = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [checking, setChecking] = useState(true)
  const usernameRef = useRef<HTMLInputElement>(null)

  // If a valid session already exists, redirect immediately
  useEffect(() => {
    fetch('/api/admin/session', { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then((d: { role: string }) => {
        window.location.href = d.role === 'bank' ? '/admin/bank-dashboard' : '/admin/dashboard'
      })
      .catch(() => {
        setChecking(false)
        setTimeout(() => usernameRef.current?.focus(), 50)
      })
  }, [])

  async function handleLogin() {
    if (!username.trim() || !pw.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: pw }),
      })
      if (res.ok) {
        const data = await res.json() as { redirectTo: string }
        window.location.href = data.redirectTo
      } else if (res.status === 429) {
        setError('Too many attempts. Try again later.')
        setPw('')
      } else {
        const data = await res.json() as { error?: string }
        setError(data.error || 'Incorrect credentials.')
        setPw('')
      }
    } catch {
      setError('Connection error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <main style={styles.root}>
        <div style={{ fontSize: 13, color: '#aaa' }}>Loading…</div>
      </main>
    )
  }

  const canSubmit = !loading && username.trim().length > 0 && pw.trim().length > 0

  return (
    <main style={styles.root}>
      {/* Wordmark */}
      <a href="/" style={styles.wordmark}>Plenti</a>

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.cardHeader}>
          <div style={styles.iconWrap}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#27500A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <div>
            <h1 style={styles.heading}>Admin sign in</h1>
            <p style={styles.sub}>Enter your credentials to continue.</p>
          </div>
        </div>

        {/* Fields */}
        <div style={styles.fields}>
          <label style={styles.label}>
            Username
            <input
              ref={usernameRef}
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="e.g. admin"
              autoComplete="username"
              style={{ ...styles.input, borderColor: error ? '#E24B4A' : '#ddd' }}
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              autoComplete="current-password"
              style={{ ...styles.input, borderColor: error ? '#E24B4A' : '#ddd' }}
            />
          </label>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBanner}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#993C1D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleLogin}
          disabled={!canSubmit}
          style={{
            ...styles.btn,
            opacity: canSubmit ? 1 : 0.55,
            cursor: loading ? 'wait' : canSubmit ? 'pointer' : 'default',
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Signing in…
            </span>
          ) : 'Sign in'}
        </button>
      </div>

      {/* Back link */}
      <a href="/donate" style={styles.backLink}>← Back to donor view</a>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 20px',
    background: '#F7F7F5',
    gap: 16,
  },
  wordmark: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 22,
    color: '#27500A',
    textDecoration: 'none',
    letterSpacing: '-0.02em',
    marginBottom: 4,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    background: '#fff',
    border: '0.5px solid #e4e4e2',
    borderRadius: 18,
    padding: '28px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  cardHeader: {
    display: 'flex',
    gap: 14,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: '#EAF3DE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heading: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 20,
    fontWeight: 400,
    color: '#111',
    margin: '0 0 2px',
    lineHeight: 1.2,
  },
  sub: {
    fontSize: 13,
    color: '#888',
    margin: 0,
    lineHeight: 1.4,
  },
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    fontSize: 12,
    fontWeight: 500,
    color: '#555',
    letterSpacing: '0.01em',
  },
  input: {
    fontSize: 14,
    padding: '10px 12px',
    border: '0.5px solid #ddd',
    borderRadius: 10,
    outline: 'none',
    background: '#fff',
    fontFamily: 'inherit',
    color: '#111',
    transition: 'border-color 0.15s',
  },
  errorBanner: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
    background: '#FEF3EE',
    border: '0.5px solid #F5C4B4',
    borderRadius: 8,
    padding: '9px 12px',
    fontSize: 13,
    color: '#993C1D',
    lineHeight: 1.4,
  },
  btn: {
    width: '100%',
    padding: '11px 0',
    background: '#27500A',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    fontFamily: 'inherit',
    letterSpacing: '-0.01em',
    transition: 'opacity 0.15s',
  },
  backLink: {
    fontSize: 12,
    color: '#aaa',
    textDecoration: 'none',
    marginTop: 4,
  },
}
