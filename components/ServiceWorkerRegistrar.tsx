'use client'
// components/ServiceWorkerRegistrar.tsx
import { useEffect } from 'react'

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker registration failed — not critical
      })
    }
  }, [])

  return null
}
