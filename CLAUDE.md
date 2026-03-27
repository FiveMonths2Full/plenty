# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

No test framework is configured in this project.

## Architecture

**Plenty** is a Next.js 14 PWA that helps donors contribute what local food banks need. It is entirely client-side — no backend, no database. All data persists in browser `localStorage`.

### State & Data Flow

`lib/store.tsx` exposes a React Context (`StoreProvider`) wrapping the entire app in `app/layout.tsx`. All components access state via `useStore()`. Every mutation immediately writes to localStorage via helpers in `lib/storage.ts`.

- `lib/types.ts` — TypeScript interfaces (`Bank`, `Item`) and `DEFAULT_BANKS` seed data
- `lib/storage.ts` — read/write helpers for the four localStorage keys (`plenty_banks_v2`, `plenty_list_v2`, `plenty_done_v2`, `plenty_active_bank`)
- `lib/store.tsx` — global state, computed values, and mutation methods

### Routing

- `/` — public donor view (two tabs: Needs, My List)
- `/admin` — password login (sessionStorage-based, password from `NEXT_PUBLIC_ADMIN_PASSWORD`)
- `/admin/dashboard` — CRUD for banks and items; redirects to `/admin` if not authenticated

`vercel.json` rewrites handle clean URLs.

### UI Conventions

- All styling is inline (no CSS modules, no Tailwind). Global resets and CSS variables are in `app/globals.css`.
- Mobile-first, 480px max-width containers.
- Green color theme: `#27500A` primary, `#3B6D11` mid, `#EAF3DE` light.
- Shared primitives (badges, spinner, toast, empty state) live in `components/ui.tsx`.

### Key Types

```typescript
interface Item {
  id: number
  name: string
  detail: string
  priority: 'high' | 'medium' | 'low'
  qty: number
}

interface Bank {
  id: number
  name: string
  location: string
  items: Item[]
}
```

### Environment

Set `NEXT_PUBLIC_ADMIN_PASSWORD` in `.env.local` before running locally or deploying. The default fallback is `plenty2024`.
