# VYNL - Music Streaming Platform

An invite-only, direct-to-consumer music platform where creators sell tracks/albums, run subscription tiers, and get paid via Stripe Connect. Built with Next.js 14 (App Router), TypeScript, and Prisma/PostgreSQL.

## Features

### Fans
- Discover and follow creators, stream tracks, like/comment
- Build and manage playlists (public and private)
- Buy tracks/albums/merchandise, subscribe to creators' tiers
- Library, following list, and purchase history

### Creators
- Upload tracks (transcoded and hosted via Mux; falls back to local disk storage in dev when Mux isn't configured - see Deployment)
- Customize the name/price/features of each subscription tier, or turn a tier off
- Run a merch shop, view real revenue/subscriber analytics
- Get paid out via Stripe Connect (Express accounts)
- Request paid ad placement (admin-reviewed; there's no ad-serving system yet - see Admin below)
- Apply for creator access if not already invited

### Admin
- Review and approve/reject creator applications and ad requests
- User management: search, suspend/reactivate, promote/demote creator or admin status
- Content moderation: take down or restore any track, with a reason
- Adjust the platform's revenue-share fee percentage
- Real platform stats and activity feed (no fabricated metrics)

### Invite system
- Existing creators/admins can invite new creators or admins by email
- **Note**: `/auth/signup` itself currently has no invite-code check, so despite the platform being invite-only in concept, anyone can create a fan account today.

## Tech Stack

- **Framework**: Next.js 14.2.16 (App Router), TypeScript, Tailwind CSS
- **Database**: PostgreSQL via Prisma ORM (schema managed with `prisma db push`, not migrations - see Deployment)
- **Auth**: NextAuth.js, credentials provider, JWT sessions
- **Payments**: Stripe (Checkout + Connect Express for creator payouts)
- **Audio hosting**: Mux (transcoding, adaptive playback); local disk storage as a dev-only fallback
- **Email**: Resend (no real fallback - see Deployment)
- **Deployment target**: Vercel

## Local Setup

### Prerequisites
- Node.js 18+
- A PostgreSQL database (local or cloud)
- Optional for full functionality: Stripe account, Mux account, Resend account

### Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` in the project root:
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/vynl_dev"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate with: openssl rand -base64 32"

   # Optional in dev - features degrade gracefully without these:
   STRIPE_SECRET_KEY=""
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
   STRIPE_WEBHOOK_SECRET=""
   MUX_TOKEN_ID=""
   MUX_TOKEN_SECRET=""
   MUX_WEBHOOK_SECRET=""
   RESEND_API_KEY=""
   EMAIL_FROM="noreply@yourdomain.com"
   ```

3. Push the schema and generate the Prisma client:
   ```bash
   npx prisma db push
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

5. Bootstrap your first admin account (see Deployment - same script works locally):
   ```bash
   node scripts/bootstrap-admin.js you@example.com
   ```

## Deployment (Vercel)

```bash
npm run deploy       # vercel --prod
npm run deploy:preview   # vercel (preview deployment)
```
Or connect the GitHub repo to Vercel for deploys on push. `prisma generate` already runs in `postinstall`/`prebuild`, so no extra build configuration is needed.

### Required environment variables

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Production Postgres connection string |
| `NEXTAUTH_URL` | Exact production domain, `https://...` |
| `NEXTAUTH_SECRET` | Real random secret, not a dev placeholder |
| `STRIPE_SECRET_KEY` | Live secret key (`sk_live_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Live publishable key (`pk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | From a webhook endpoint at `/api/stripe/webhook` |
| `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` | **Required in production** - see gotcha below |
| `MUX_WEBHOOK_SECRET` | From a webhook endpoint at `/api/mux/webhook` |
| `RESEND_API_KEY` | **Required for real email delivery** - see gotcha below |
| `EMAIL_FROM` | A verified sending address on your Resend domain |

**Stripe webhook events to subscribe to**: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`, `account.updated`.

**Mux webhook events**: `video.upload.asset_created`, `video.upload.errored`, `video.asset.ready`, `video.asset.errored`, `video.asset.static_renditions.ready`, `video.asset.static_renditions.errored`.

**Stripe dashboard, one-time**: Connect must be enabled on your account (creator payouts use Express accounts).

### Gotchas

- **Mux is not optional in production.** Without `MUX_TOKEN_ID`/`MUX_TOKEN_SECRET`, uploads fall back to writing to `public/uploads/audio` on local disk - Vercel's deployment bundle is read-only, so that write fails or doesn't persist. Configure Mux before real users upload tracks.
- **Without `RESEND_API_KEY`, email silently no-ops.** There's no real SMTP fallback; `sendEmail` just logs to the server console and reports success. Welcome emails, invites, application decisions, and payment/subscription confirmations would all "succeed" while never being delivered.
- **Bootstrapping your first admin** requires one script run, since granting `isAdmin` through the app itself requires an existing admin (chicken-and-egg on a fresh database):
  ```bash
  DATABASE_URL="<prod-url>" node scripts/bootstrap-admin.js you@example.com
  ```
  It refuses to run if any admin already exists, so it can't be reused as a standing backdoor - further admins go through the normal invite flow.
- **Schema changes use `prisma db push`, not migrations.** There's no `prisma/migrations` history. That's fine pre-launch, but before you have real user data at stake, switch to `prisma migrate dev` (tracked migration files) + `prisma migrate deploy` in your deploy step - `db push` has no history and can silently drop data on a destructive change.

## Project Structure

```
src/
├── app/                # Next.js App Router: pages + API routes
│   ├── api/             # API routes (mirrors the page structure)
│   ├── admin/            # Admin dashboard (isAdmin-gated)
│   ├── creator/          # Creator's own dashboard, studio, shop
│   ├── artist/[id]/       # Public creator profile/store/subscribe pages
│   └── fan/              # Fan dashboard
├── components/          # React components, organized by area
├── lib/                # Shared server logic (auth, stripe, mux, email, revenue-ledger, ...)
├── hooks/               # Client hooks
├── middleware.ts        # Auth gate for protected routes (explicit allowlist - see the file's own comment)
└── types/               # Ambient type declarations
prisma/
└── schema.prisma        # Database schema
scripts/
└── bootstrap-admin.js   # One-time first-admin bootstrap (see Deployment)
```

## Scripts

```bash
npm run dev             # Development server
npm run build            # Production build
npm start                # Run a production build
npm run lint              # ESLint
npm run bootstrap-admin -- you@example.com   # First-admin bootstrap (or call the script directly, see Deployment)
```
