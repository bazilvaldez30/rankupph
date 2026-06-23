# RankUpPH — Premium Dota 2 Services Marketplace

A focused, revenue-ready MVP for Dota 2 **MMR boosting**, **duo queue**, and
**coaching** — built for the Philippine market (PHP + GCash). Luxury black × gold,
high-end-SaaS aesthetic. Multi-game-capable data model, but ships Dota 2 only.

## Tech

Next.js 15 (App Router, TS strict) · Tailwind + shadcn/ui · Framer Motion ·
TanStack Query · Zustand · Prisma + PostgreSQL (Supabase) · Auth.js v5
(credentials + Google) · Stripe + GCash · Pusher · Cloudinary · Zod.

## Milestone status

- **M1 — Foundation slice (shipped):** schema + seed, auth, luxury landing page,
  DB-driven pricing calculator, order creation, order tracking, minimal
  role-based dashboards.
- **M2** Stripe checkout + webhooks · **M3** GCash manual verification ·
  **M4** full dashboards · **M5** realtime chat + notifications · **M6** polish.

## Getting started

```bash
npm install
cp .env.example .env        # fill in DATABASE_URL / DIRECT_URL (Supabase) + AUTH_SECRET
npm run db:migrate          # create tables (needs a live DB)
npm run db:seed             # Dota 2 game, ranks, services, pricing, admin user
npm run dev                 # http://localhost:3000
```

The app **builds and runs without a database or third-party keys** — public pages
fall back to seed-mirroring data, and Stripe/Pusher/Cloudinary/Google degrade
gracefully when their env vars are blank (see `src/lib/env.ts`).

### Seeded accounts (from `prisma/seed.ts`)

- Admin: `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (default `admin@rankupph.com` / `ChangeMe123!`)
- Booster: `booster@rankupph.com` / `BoosterPass123!`

## Key conventions

- **Money is integer centavos (PHP).** Format via `src/lib/format.ts`.
- **Pricing is never hardcoded.** Per-tier-step rules + modifiers live in the DB
  (`PricingRule`, `PricingModifier`). The pure engine is `src/lib/pricing.ts`;
  the DB-bridging authoritative quote is `src/lib/pricing-service.ts`.
- **Payment success is never trusted from the client.** Order amount is always
  recomputed server-side in `POST /api/orders`. Orders become `PAID` only via
  Stripe webhook or admin GCash approval (M2/M3).
- **Auth split:** `src/lib/auth.config.ts` is edge-safe (middleware);
  `src/lib/auth.ts` holds the Prisma adapter + credentials provider.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build (`prisma generate` + `next build`) |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run db:migrate` / `db:seed` / `db:studio` | Prisma workflows |
