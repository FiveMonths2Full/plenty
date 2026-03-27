'use client'
// app/admin/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  const router = useRouter()

  function handleLogin() {
    const adminPw = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'plenty2024'
    if (pw === adminPw) {
      sessionStorage.setItem('plenty_admin', '1')
      router.push('/admin/dashboard')
    } else {
      setError(true)
      setPw('')
    }
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
          Enter your password to manage food bank data.
        </p>

        <input
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setError(false) }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="Password"
          autoFocus
          style={{
            width: '100%', fontSize: 14, padding: '10px 12px',
            border: `0.5px solid ${error ? '#E24B4A' : '#ddd'}`,
            borderRadius: 10, outline: 'none', marginBottom: 10,
            background: '#fff',
          }}
        />

        {error && (
          <p style={{ fontSize: 13, color: '#993C1D', marginBottom: 10 }}>
            Incorrect password. Try again.
          </p>
        )}

        <button
          onClick={handleLogin}
          style={{
            width: '100%', padding: 11,
            background: '#27500A', color: '#fff',
            border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Sign in
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <a href="/" style={{ fontSize: 13, color: '#888', textDecoration: 'underline' }}>
          ← Back to Plenty
        </a>
      </div>
    </main>
  )
}
