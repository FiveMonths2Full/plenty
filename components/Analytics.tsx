'use client'
import { useEffect } from 'react'
import posthog from 'posthog-js'
import { Analytics as VercelAnalytics } from '@vercel/analytics/react'

export default function Analytics() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (key && process.env.NODE_ENV === 'production') {
      posthog.init(key, {
        api_host: 'https://us.i.posthog.com',
        capture_pageview: true,
        persistence: 'localStorage',
      })
    }
  }, [])

  return <VercelAnalytics />
}
