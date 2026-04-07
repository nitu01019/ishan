# Ishan - Video Editor Portfolio

Professional video editing portfolio with admin panel, Firebase backend, and dynamic theming.

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
│   │   └── dashboard/            # Dashboard pages
│   │       ├── page.tsx          # Dashboard overview
│   │       ├── layout.tsx        # Dashboard layout shell
│   │       ├── videos/           # Video management + upload
│   │       ├── testimonials/     # Client reviews
│   │       ├── services/         # Service offerings
│   │       ├── pricing/          # Pricing plans
│   │       ├── faqs/             # FAQ management
│   │       ├── inquiries/        # Contact form submissions
│   │       ├── theme/            # Color theme customization
│   │       └── settings/         # Site text + social links
│   └── api/                      # Backend API Routes
│       ├── auth/                 # Login/logout/check
│       ├── videos/               # CRUD + upload
│       ├── testimonials/         # CRUD
│       ├── services/             # CRUD
│       ├── pricing/              # CRUD
│       ├── faqs/                 # CRUD
│       ├── inquiries/            # Contact form
│       ├── site-config/          # Site settings
│       └── upload/               # File upload to Firebase Storage
│
├── components/
│   ├── public/                   # Public-facing components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Preloader.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── sections/            # Page sections
│   │       ├── Hero.tsx
│   │       ├── RecentEdits.tsx
│   │       ├── ShortVideos.tsx
│   │       ├── LongVideos.tsx
│   │       ├── Services.tsx
│   │       ├── Skills.tsx
│   │       ├── Workflow.tsx
│   │       ├── Testimonials.tsx
│   │       ├── Pricing.tsx
│   │       ├── FAQ.tsx
│   │       └── Contact.tsx
│   └── ui/                      # Shared UI components
│       ├── Button.tsx
│       ├── SectionTitle.tsx
│       ├── VideoCard.tsx
│       ├── VideoLightbox.tsx
│       ├── ProtectedVideoPlayer.tsx
│       ├── TestimonialCard.tsx
│       ├── PricingCard.tsx
│       ├── ServiceCard.tsx
│       ├── LazyImage.tsx
│       ├── hero-shader.tsx
│       ├── animated-mesh-bg.tsx
│       ├── sparkles-text.tsx
│       ├── shine-border.tsx
│       ├── spotlight.tsx
│       └── ...
│
├── lib/                          # Backend logic
│   ├── firebase.ts              # Firebase initialization
│   ├── db.ts                    # Database operations (with seed fallback)
│   ├── storage.ts               # File upload to Firebase Storage
│   ├── auth.ts                  # HMAC-SHA256 session auth
│   └── utils.ts                 # Utilities
│
├── types/                        # TypeScript types
│   └── index.ts                 # Video, Testimonial, Service, etc.
│
├── data/                         # Seed data (fallback when Firebase is unconfigured)
│   └── seed.json
│
└── middleware.ts                 # Route protection for /admin and /api
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# Start development
pnpm dev
```

The app works out of the box with seed data. Firebase is optional for local development -- when unconfigured, the site reads from `src/data/seed.json` automatically.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `ADMIN_PASSWORD` | Yes | Password for the admin panel |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | For persistence | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | For persistence | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | For persistence | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | For persistence | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | For persistence | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | For persistence | Firebase app ID |
| `NEXT_PUBLIC_SITE_URL` | For SEO | Production domain for sitemap and canonical URLs |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | Optional | Google Search Console verification code |

## Admin Panel

**URL:** `/admin`
**Password:** Set in `.env.local` as `ADMIN_PASSWORD`

### What You Can Manage

| Page | Controls |
|------|----------|
| Videos | Upload video + thumbnail, title, description, category, duration |
| Testimonials | Client name, role, quote, rating, avatar |
| Services | Title, description, order |
| Pricing | Plan name, price, features, order |
| FAQs | Question, answer, order |
| Inquiries | View contact form submissions |
| Theme | Accent colors, backgrounds, text colors, 5 presets |
| Settings | Hero text, footer, social links, booking URL |

### Authentication

The admin panel uses HMAC-SHA256 signed cookies with 24-hour expiry. The middleware (`src/middleware.ts`) protects all `/admin/dashboard` routes and mutating `/api` routes. Public GET requests and the contact form POST are exempt from authentication.

## Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore Database** (production mode)
3. Enable **Storage**
4. Create a **Web App** and copy the config values to `.env.local`
5. Deploy Firestore rules: `pnpm deploy:firestore`
6. Deploy Storage rules: `pnpm deploy:storage`

## Deployment

```bash
# Build for production
pnpm build

# Deploy everything to Firebase
pnpm deploy

# Deploy only hosting (frontend + API)
pnpm deploy:hosting

# Deploy only database rules
pnpm deploy:rules
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start local development server |
| `pnpm build` | Create production build |
| `pnpm start` | Run production server locally |
| `pnpm lint` | Run ESLint |
| `pnpm deploy` | Deploy everything to Firebase |
| `pnpm deploy:hosting` | Deploy only hosting |
| `pnpm deploy:firestore` | Deploy only Firestore rules |
| `pnpm deploy:storage` | Deploy only Storage rules |
| `pnpm deploy:rules` | Deploy both Firestore and Storage rules |

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS 3.4 + CSS Variables (dynamic theming)
- **Animations:** Framer Motion 11, WebGL Shaders (`@paper-design/shaders-react`), Spline 3D
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage
- **Auth:** HMAC-SHA256 signed cookies (timing-safe comparison)
- **Data Fetching:** SWR
- **UI Components:** Radix UI primitives, Lucide icons, Embla Carousel
- **SEO:** JSON-LD structured data, sitemap, robots.txt, Open Graph, Twitter Cards
- **Fonts:** Playfair Display (headings) + Inter (body) via `next/font`
