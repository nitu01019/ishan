# Ishan - Video Editor Portfolio

Professional video editing portfolio with an admin panel, Supabase backend, and dynamic theming.

**Last Updated:** 2026-04-19

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS 3.4 + CSS Variables (dynamic theming)
- **Database:** Supabase (Postgres)
- **Storage:** Supabase Storage (`uploads` bucket, TUS resumable uploads)
- **Auth:** HMAC-SHA256 signed cookies (timing-safe comparison)
- **Data Fetching:** SWR
- **Animations:** Framer Motion 11, WebGL Shaders (`@paper-design/shaders-react`), Spline 3D
- **UI:** Radix UI primitives, Lucide icons, Embla Carousel
- **SEO:** JSON-LD structured data, sitemap, robots.txt, Open Graph, Twitter Cards
- **Fonts:** Playfair Display (headings) + Inter (body) via `next/font`
- **Hosting:** Netlify (via `@netlify/plugin-nextjs`)
- **Package manager:** pnpm

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Public homepage
│   ├── layout.tsx                # Root layout + ThemeProvider
│   ├── globals.css               # Global styles + CSS variables
│   ├── robots.ts                 # SEO robots.txt
│   ├── sitemap.ts                # SEO sitemap.xml
│   ├── admin/                    # Admin Panel
│   │   ├── page.tsx              # Login page
│   │   └── dashboard/            # Dashboard pages (videos, testimonials, services,
│   │                             #   pricing, faqs, inquiries, theme, settings)
│   └── api/                      # Backend API Routes
│       ├── auth/                 # Login/logout/check
│       ├── videos/               # CRUD + upload metadata
│       ├── testimonials/         # CRUD
│       ├── services/             # CRUD
│       ├── pricing/              # CRUD
│       ├── faqs/                 # CRUD
│       ├── inquiries/            # Contact form
│       ├── site-config/          # Site settings
│       └── upload/               # Signed upload endpoints (Supabase Storage)
│
├── components/
│   ├── public/                   # Public-facing components + page sections
│   └── ui/                       # Shared UI components
│
├── lib/                          # Backend logic
│   ├── supabase.ts               # Supabase client initialization
│   ├── db.ts                     # Database operations (seed fallback)
│   ├── storage.ts                # File upload helpers (Supabase Storage)
│   ├── auth.ts                   # HMAC-SHA256 session auth
│   └── utils.ts                  # Utilities
│
├── types/                        # TypeScript types
├── data/                         # Seed data (fallback when Supabase is unconfigured)
└── middleware.ts                 # Route protection for /admin and mutating /api routes
```

## Quick Start

```bash
# 1. Clone
git clone <repo-url> && cd frontend

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local and fill in values (see Environment Variables below)

# 3. Install dependencies
pnpm install

# 4. Start development
pnpm dev
```

Open <http://localhost:3000>. The app works out of the box with seed data; Supabase is optional for local development — when unconfigured, the site reads from `src/data/seed.json` automatically.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the following. For production, set these in the Netlify UI (see `docs/deploy/netlify-env-vars.md`).

| Variable | Required | Description |
|----------|----------|-------------|
| `ADMIN_PASSWORD` | Yes | Password for the admin panel (20+ random chars in prod) |
| `SESSION_SECRET` | Yes (prod) | Secret used to sign session tokens; 32+ bytes hex. Falls back to `ADMIN_PASSWORD` if unset — always set explicitly in production. |
| `NEXT_PUBLIC_SUPABASE_URL` | For persistence | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For persistence | Supabase anon/public key |
| `NEXT_PUBLIC_SITE_URL` | For SEO | Production domain for sitemap and canonical URLs |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | Optional | Google Search Console verification code |

### Supabase Storage setup

1. Supabase Dashboard → Storage → **New Bucket** → name it `uploads` (public).
2. Storage → Policies → add a policy on `uploads` that allows `INSERT` for the `anon` role (enables direct browser uploads).
3. Add a policy allowing `SELECT` for `anon` (enables public read).

See `docs/VIDEO-UPLOAD-GUIDE.md` for the full upload flow.

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start local development server |
| `pnpm build` | Create production build |
| `pnpm start` | Run production server locally |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run unit/integration tests |

## Admin Panel

- **URL:** `/admin`
- **Password:** `ADMIN_PASSWORD` from `.env.local`

Manage: Videos, Testimonials, Services, Pricing, FAQs, Inquiries, Theme, Settings.

The admin panel uses HMAC-SHA256 signed cookies with 24-hour expiry. The middleware (`src/middleware.ts`) protects all `/admin/dashboard` routes and mutating `/api` routes. Public GET requests and the contact form POST are exempt from authentication.

## Deployment

The site deploys to **Netlify** via the `@netlify/plugin-nextjs` runtime.

1. Push to GitHub; Netlify is connected to the repo and auto-deploys on push to `main`.
2. Each PR gets a preview deploy URL.
3. Environment variables are configured in **Netlify UI → Site settings → Environment variables** (see `docs/deploy/netlify-env-vars.md`).
4. Follow the full release checklist in `docs/deploy/runbook.md`.

### Smoke test

```bash
./scripts/smoke-test.sh https://<preview-url>
```

### Rollback

Netlify UI → **Deploys** → pick the previous green deploy → **Publish deploy**.

## Documentation

- [`docs/VIDEO-UPLOAD-GUIDE.md`](docs/VIDEO-UPLOAD-GUIDE.md) — video upload flow
- [`docs/deploy/netlify-env-vars.md`](docs/deploy/netlify-env-vars.md) — required Netlify env vars
- [`docs/deploy/runbook.md`](docs/deploy/runbook.md) — deploy + rollback runbook
