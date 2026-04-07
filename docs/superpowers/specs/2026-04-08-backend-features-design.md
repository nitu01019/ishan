# Backend & Features Design Spec

**Date:** 2026-04-08  
**Project:** Ishan's Video Editor Portfolio  
**Stack:** Next.js 14 (App Router), Firebase (Firestore + Storage), Tailwind CSS, Framer Motion  
**Deploy:** Vercel (frontend) + Firebase (backend/data)

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────┐
│   Public Site    │────▶│  Next.js API      │────▶│   Firebase    │
│   (Vercel SSR)  │     │  Routes           │     │   Firestore   │
└─────────────────┘     └──────────────────┘     │   Storage     │
                              │                   └───────────────┘
┌─────────────────┐           │                         │
│   Admin Panel   │───────────┘                         │
│   (/admin/*)    │     Auth: HMAC-signed cookies        │
└─────────────────┘     Middleware: /admin/dashboard/*   │
                        + POST/PUT/DELETE on /api/*       │
                                                          │
                        Fallback: seed.json when          │
                        Firebase not configured            │
```

## Sub-Projects

### 1. Backend Foundation
- **Auth**: HMAC-SHA256 signed session tokens (replaces plain "authenticated" cookie)
- **Middleware**: Next.js middleware protecting admin routes and write API operations
- **Admin Fix**: All dashboard pages use `.id` (was `.id` in data, `._id` in admin code)
- **Data Flow**: `page.tsx` calls async db functions → Firebase when configured, seed.json fallback

### 2. Video Management
- **Protected Player**: Custom HTML5 player with anti-download/screenshot protections
  - `controlsList="nodownload"`, disabled right-click, transparent overlay
  - Diagonal watermark "Ishan" at low opacity
  - Supports both direct video files and YouTube embeds (nocookie domain)
- **Video Lightbox**: Modal overlay with ProtectedVideoPlayer, close on Escape/backdrop
- **VideoCard Update**: Shows thumbnails when available, opens lightbox on click

### 3. Contact & Booking Flow
- **Contact Section** (`#contact`): Form with name, email, phone, project type, budget, message
- **API Route**: POST /api/inquiries (public), GET /api/inquiries (admin-only)
- **Admin Page**: View/manage inquiries, mark as read, delete
- **Button Wiring**:
  - "Hire Me" (Hero) → scrolls to #contact
  - "Book a Call" (Services) → scrolls to #contact
  - "Get Started" (Pricing) → scrolls to #contact

### 4. Frontend Polish
- **Preloader**: 2.5s minimum display time, slower progress curve, then fade out
- **Skeleton Loading**: Section-specific skeletons for every dynamic import
- **Dynamic Data**: page.tsx uses async db functions instead of static seed.json import

## Data Model

### Inquiry (NEW)
| Field | Type | Description |
|-------|------|-------------|
| id | string | Auto-generated `inq_${timestamp}` |
| name | string | Client name (required) |
| email | string | Client email (required) |
| phone | string | Phone (optional) |
| projectType | enum | short-form, long-form, thumbnail, seo, consulting, other |
| budget | string | Budget range |
| message | string | Project description (required) |
| selectedPlan | string | Pre-selected pricing plan |
| createdAt | string | ISO timestamp |
| isRead | boolean | Admin read status |

## Security
- HMAC-signed session cookies (24h expiry)
- Middleware-level auth for admin routes
- Input validation on contact form (server-side)
- Video protection: no download, no right-click, watermark overlay
- CSP headers for YouTube nocookie embeds
