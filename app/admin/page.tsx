'use client'
// app/admin/page.tsx
import { useState, useEffect } from 'react'

export default function AdminLogin() {
  const [username, setUsername]   = useState('')
  const [pw, setPw]               = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [checking, setChecking]   = useState(true)

  // If a valid session already exists, redirect immediately
  useEffect(() => {
    fetch('/api/admin/session', { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then((d: { role: string }) => {
        window.location.href = d.role === 'bank' ? '/admin/bank-dashboard' : '/admin/dashboard'
      })
      .catch(() => setChecking(false))
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
      <main style={{ maxWidth: 360, margin: '80px auto 0', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#aaa' }}>Loading…</div>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 360, margin: '80px auto 0', padding: '0 20px' }}>
      <div style={{
        background: '#fff', border: '0.5px solid #e8e8e8',
        borderRadius: 16, padding: '28px 24px',
      }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, fontWeight: 400, marginBottom: 4 }}>
          Admin
        </h1>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
          Sign in with your admin credentials.
        </p>

        <input
          type="text"
          value={username}
          onChange={e => { setUsername(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="Username"
          autoFocus
          autoComplete="username"
          style={{
            width: '100%', fontSize: 14, padding: '10px 12px',
            border: `0.5px solid ${error ? '#E24B4A' : '#ddd'}`,
            borderRadius: 10, outline: 'none', marginBottom: 10,
            background: '#fff', fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />

        <input
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="Password"
          autoComplete="current-password"
          style={{
            width: '100%', fontSize: 14, padding: '10px 12px',
            border: `0.5px solid ${error ? '#E24B4A' : '#ddd'}`,
            borderRadius: 10, outline: 'none', marginBottom: 10,
            background: '#fff', fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />

        {error && (
          <p style={{ fontSize: 13, color: '#993C1D', marginBottom: 10 }}>{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading || !username.trim() || !pw.trim()}
          style={{
            width: '100%', padding: 11,
            background: '#27500A', color: '#fff',
            border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
            cursor: loading ? 'wait' : 'pointer',
            opacity: (loading || !username.trim() || !pw.trim()) ? 0.7 : 1,
          }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <a href="/donate" style={{ fontSize: 13, color: '#888', textDecoration: 'underline' }}>
          ← Back to Plenti
        </a>
      </div>
    </main>
  )
}
