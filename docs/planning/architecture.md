# Architecture — Video Editor Portfolio

## Tech Stack
- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Styling:** Tailwind CSS 3.4+ custom theme
- **Animations:** Framer Motion 11+
- **Carousels:** Embla Carousel + autoplay plugin
- **Icons:** Lucide React
- **Fonts:** Playfair Display (headings), Inter (body) via next/font/google
- **Database:** Firebase Firestore (optional, fallback to seed.json)
- **Storage:** Firebase Storage (optional)
- **Auth:** Simple password + httpOnly cookie

## Folder Structure
```
src/
├── app/
│   ├── layout.tsx              # Root layout: fonts, metadata, global styles
│   ├── page.tsx                # Homepage: imports all section components
│   ├── globals.css             # Tailwind directives + custom CSS (marquee, glow)
│   ├── admin/
│   │   ├── page.tsx            # Login page
│   │   └── dashboard/
│   │       ├── layout.tsx      # Admin sidebar layout
│   │       ├── page.tsx        # Dashboard overview / redirect to videos
│   │       ├── videos/page.tsx
│   │       ├── testimonials/page.tsx
│   │       ├── services/page.tsx
│   │       ├── pricing/page.tsx
│   │       ├── faqs/page.tsx
│   │       └── settings/page.tsx
│   └── api/
│       ├── videos/
│       │   ├── route.ts        # GET (list), POST (create)
│       │   └── [id]/route.ts   # PUT, DELETE
│       ├── testimonials/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── services/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── pricing/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── faqs/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── site-config/route.ts
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   └── check/route.ts
│       └── upload/route.ts
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── RecentEdits.tsx
│   │   ├── ShortVideos.tsx
│   │   ├── LongVideos.tsx
│   │   ├── Services.tsx
│   │   ├── Skills.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Pricing.tsx
│   │   └── FAQ.tsx
│   └── ui/
│       ├── VideoCard.tsx       # Portrait + landscape variants via props
│       ├── ServiceCard.tsx     # Green gradient tilted card
│       ├── TestimonialCard.tsx # Star rating + quote + avatar
│       ├── PricingCard.tsx     # With highlighted variant
│       ├── Button.tsx          # Pill + rectangular variants
│       └── SectionTitle.tsx    # White text with green keyword
├── lib/
│   ├── firebase.ts             # Firebase app init (conditional)
│   ├── db.ts                   # Repository pattern: Firestore or seed.json
│   ├── storage.ts              # Upload helper
│   └── auth.ts                 # Cookie session helpers
├── data/
│   └── seed.json               # Full seed data for all collections
└── types/
    └── index.ts                # All TypeScript interfaces
```

## Component Tree
```
layout.tsx
└── page.tsx
    ├── Navbar
    ├── Hero
    │   ├── Button (x2)
    │   └── AvatarStack
    ├── RecentEdits
    │   └── EmblaCarousel → VideoCard (landscape)
    ├── ShortVideos
    │   └── VideoCard (portrait) x3
    ├── LongVideos
    │   └── VideoCard (landscape) x6
    ├── Services
    │   └── ServiceCard x4
    ├── Skills (marquee rows)
    ├── Testimonials
    │   └── EmblaCarousel → TestimonialCard x3+
    ├── Pricing
    │   └── PricingCard x3
    ├── FAQ
    │   └── AccordionItem x7
    └── Footer
```

## Data Flow
```
seed.json (static) ──┐
                     ├──> db.ts (repository) ──> API route handlers ──> Frontend (fetch/SWR)
Firebase Firestore ──┘
```

1. `db.ts` exports a repository with standard CRUD methods
2. At initialization, checks for `NEXT_PUBLIC_FIREBASE_PROJECT_ID` env var
3. If present → use Firestore adapter
4. If absent → use local JSON adapter (reads seed.json, writes to /tmp for dev)
5. API routes use the repository, unaware of the underlying adapter
6. Frontend components fetch from `/api/*` routes using SWR or fetch
7. Admin panel uses the same API routes with auth cookie

## State Management
- **No global state library** — React useState/useReducer only
- **Data fetching:** SWR for client components, fetch for server components
- **Admin forms:** Local React state per form
- **Scroll state:** Framer Motion useScroll (no external store)
- **Navbar scroll detection:** useState + useEffect with scroll listener

## Key Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| No UI library | Custom Tailwind | Full design control, matches reference exactly |
| Embla over Swiper | Embla Carousel | Lighter (2KB vs 40KB), better React integration |
| SWR over React Query | SWR | Simpler API, Next.js team recommendation, lighter |
| Cookie auth over JWT | httpOnly cookie | Simpler, no token refresh logic, XSS-safe |
| Repository pattern | Adapter-based | Clean Firebase/JSON swap without touching routes |
| CSS marquee over JS | CSS animation | 60fps guaranteed, no JS overhead for infinite scroll |
