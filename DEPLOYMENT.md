# RankUpPH — Deployment Guide (Vercel + Supabase)

Production checklist for shipping the MVP. Target: **Vercel** (app) + **Supabase**
(Postgres). The app already builds with `prisma generate && next build`.

## 1. Database (Supabase)
1. Use your existing Supabase project (or create a prod one).
2. Get the two connection strings (Connect → ORMs → Prisma):
   - `DATABASE_URL` — pooled (port **6543**, `?pgbouncer=true`)
   - `DIRECT_URL` — direct (port **5432**)
3. Apply the schema to the prod DB from your machine:
   ```bash
   npx prisma db push        # or: prisma migrate deploy (if you adopt migrations)
   npm run db:seed           # seeds Dota 2 catalog, pricing, admin + booster
   ```
4. **Change the seeded admin password** immediately (`SEED_ADMIN_PASSWORD`, then re-seed
   or update via DB), and rotate `booster@rankupph.com`.

## 2. Vercel project
1. Import the repo. Framework preset: **Next.js** (auto). Build command stays
   `prisma generate && next build` (the project's `build` script) — leave default.
2. Add all environment variables (below) for **Production** (and Preview if used).
3. Deploy. Set the production domain, then update `NEXT_PUBLIC_APP_URL` to it and redeploy.

## 3. Environment variables (Production)
**Generate fresh secrets — do NOT reuse dev values:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"  # AUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"  # ENCRYPTION_KEY
```

| Var | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL`, `DIRECT_URL` | ✅ | Supabase pooled + direct |
| `NEXT_PUBLIC_APP_URL` | ✅ | `https://yourdomain.com` |
| `AUTH_SECRET` | ✅ | fresh 32-byte base64 |
| `AUTH_TRUST_HOST` | ✅ | `true` |
| `ENCRYPTION_KEY` | ✅ | fresh 32-byte base64 — **credentials can't decrypt without the same key**; never rotate after data exists or you lose access to stored credentials |
| `STRIPE_SECRET_KEY` | ✅ for cards | **live** key (`sk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | ✅ for cards | from the prod webhook endpoint (step 4) |
| `GCASH_NUMBER`, `GCASH_NAME` | ✅ | your real payee details |
| `PUSHER_*`, `NEXT_PUBLIC_PUSHER_*` | optional | realtime chat (else polling) |
| `CLOUDINARY_*`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | optional | image uploads |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | optional | Google sign-in |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | seed only | not needed at runtime |

## 4. Stripe (production)
1. Toggle Stripe to **live mode**, copy the live secret key.
2. **Developers → Webhooks → Add endpoint:**
   `https://yourdomain.com/api/payments/stripe/webhook`
3. Subscribe to: `checkout.session.completed`, `payment_intent.succeeded`,
   `payment_intent.payment_failed`.
4. Copy the endpoint's **signing secret** → `STRIPE_WEBHOOK_SECRET`.

## 5. Auth / Google (if used)
- Google OAuth: add `https://yourdomain.com/api/auth/callback/google` as an authorized
  redirect URI.

## 6. Post-deploy smoke test
- [ ] Landing renders; OG image at `/opengraph-image` looks right.
- [ ] Register → role redirect → place order → **Stripe live** test (or GCash submit).
- [ ] Stripe webhook flips order to PAID (check Stripe dashboard → webhook deliveries).
- [ ] Admin assigns/booster claims → progress → confirm.
- [ ] Credential submit + reveal writes to `/admin/audit`.
- [ ] Chat shows **Live** (Pusher) and image upload works (Cloudinary).
- [ ] `sitemap.xml` and `robots.txt` resolve.

## Notes
- All pricing is DB-driven — tune it at `/admin/pricing` (no redeploy needed).
- `ENCRYPTION_KEY` is the one secret you must back up safely and never change once
  credentials exist.
