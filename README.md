# Plenty 🌿

> Give what your local food bank actually needs.

A mobile-first web app that shows donors exactly what their local food banks need before they go shopping. Built with Next.js 14, TypeScript, and localStorage persistence. No backend required to get started.

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set your admin password

Copy `.env.local` (already included) and change the password:

```
NEXT_PUBLIC_ADMIN_PASSWORD=your-password-here
```

> ⚠️ Never commit `.env.local` to git. It's already in `.gitignore`.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone or in a mobile-sized browser window.

---

## Routes

| Route | What it is |
|---|---|
| `/` | User-facing app (what donors see) |
| `/admin` | Password-protected login |
| `/admin/dashboard` | Admin panel — manage banks and items |

### Shareable bank links

From the admin dashboard, hit **Copy share link** next to any food bank. This generates a URL like:

```
https://your-app.vercel.app/?bank=2
```

When a donor opens that link, the app automatically selects that food bank.

---

## Deploying to Vercel

1. Push this repo to GitHub (make sure `.env.local` is gitignored ✓)
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. In **Environment Variables**, add:
   ```
   NEXT_PUBLIC_ADMIN_PASSWORD = your-secure-password
   ```
4. Hit **Deploy** — done.

---

## Data & persistence

Right now all data lives in the user's browser (`localStorage`). This means:

- ✅ Zero backend needed — deploy instantly
- ✅ Works offline after first load
- ⚠️ Admin changes on one device don't sync to other users' devices

**When you're ready to sync data across devices**, the recommended upgrade path is:

1. Add a simple API route (`/api/banks`) backed by a database (e.g. Vercel Postgres, PlanetScale, or Supabase)
2. Replace the `loadBanks` / `saveBanks` calls in `lib/storage.ts` with `fetch` calls to that API
3. The rest of the app stays the same

---

## Project structure

```
plenty/
├── app/
│   ├── layout.tsx           # Root layout, metadata, PWA config
│   ├── page.tsx             # User app (home screen)
│   ├── globals.css          # Global styles + font imports
│   └── admin/
│       ├── page.tsx         # Login screen
│       └── dashboard/
│           └── page.tsx     # Admin dashboard
├── components/
│   ├── BankSelector.tsx     # Food bank dropdown
│   ├── NeedsView.tsx        # Items list with qty stepper
│   ├── MyListView.tsx       # Shopping checklist + confirm state
│   └── ui.tsx               # Shared primitives (badge, spinner, toast, etc.)
├── lib/
│   ├── types.ts             # TypeScript types + default seed data
│   ├── storage.ts           # localStorage read/write helpers
│   └── store.tsx            # Global state (React Context)
├── public/
│   └── manifest.json        # PWA manifest (installable on mobile)
├── .env.local               # Admin password (never commit this)
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## Customising the seed data

Edit `lib/types.ts` — the `DEFAULT_BANKS` array is what users see on first load (before any admin changes). Update the food bank names, locations, and items to match your actual area.

---

## Mobile web app install

Because this ships a `manifest.json`, users on iOS and Android can add it to their home screen:

- **iOS Safari**: Share → Add to Home Screen
- **Android Chrome**: Menu → Add to Home Screen

It will open full-screen, no browser chrome, just like a native app — without going through the App Store.

---

## MVP constraints (intentional)

Per the original brief, this version intentionally excludes:

- User accounts / auth
- Payment processing
- Receipt / tax tracking
- Real-time nonprofit integrations
- Maps / geolocation
- Native app builds

These are all valid next steps once the behaviour is validated.
