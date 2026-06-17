# My Home Budapest

Premium, bilingual (HU/EN) **off-market** luxury real estate portfolio for Budapest — [myhomebudapest.hu](https://myhomebudapest.hu).

This is a discreet portfolio for properties that are *not* listed on public portals (e.g. ingatlan.com). It is built for a small number of high-net-worth Hungarian and international buyers — not for mass lead generation.

## Status

**Phase 1 — frontend-first.** The site runs entirely on local mock data (`src/lib/mock-data.ts`) with localStorage-based favorites. Backend integrations (Supabase, Cloudflare R2, Resend, Google Maps) are stubbed and will be wired in later phases.

## Requirements

- **Node.js ≥ 18.17** (Node 20 LTS recommended). Next.js 14 will refuse to start on older versions.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/hu` (Hungarian default). English is at `/en`.

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router, SSR) |
| Styling | Tailwind CSS (custom navy/gold theme) |
| i18n | next-intl (HU/EN) |
| Animation | Framer Motion |
| Icons | lucide-react |
| Database *(later)* | Supabase (PostgreSQL + Auth) |
| Images *(later)* | Cloudflare R2 |
| Email *(later)* | Resend |
| Maps *(later)* | Google Maps API |
| PDF *(later)* | react-pdf |

## Brand

Colors extracted from the logo:

- **Navy** `#0a1628` — backgrounds, navbar, footer
- **Gold / champagne** `#C9A96E` — accents, buttons, badges, dividers
- **Light grey** `#F5F5F5` — card backgrounds, alternating rows

Type: **Playfair Display** (headings), **Inter** (body).

## Project structure

```
src/
  app/[locale]/      # localized routes (homepage, …)
  components/        # UI components (navbar, footer, home/*)
  lib/               # types, mock data, districts, utils
  messages/          # hu.json / en.json translation strings
  i18n.ts            # next-intl request config
  middleware.ts      # locale routing
```

## Logo

The official logo (rose-gold lockup on transparent background) lives at `public/logo.png` (500×500). The `Logo` component renders it via `next/image`; size it per call site with a `className` such as `h-14 w-auto`.
