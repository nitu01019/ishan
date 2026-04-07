# Performance Plan — Video Editor Portfolio

## Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|-----------|-------|----------------|
| Mobile | 0–767px | Single column, hamburger nav, stacked cards, horizontal scroll for carousels |
| Tablet | 768px+ | 2-column grids begin, nav visible, service cards reduced rotation |
| Desktop | 1024px+ | Full layout, sticky service sidebar, 3-col pricing/testimonials |
| Large | 1280px+ | max-w-7xl container, full spacing |

### Per-Section Responsive
- **Navbar:** Hamburger on mobile, full nav on md+
- **Hero:** text-4xl → text-5xl → text-6xl, buttons stack on mobile
- **Short Videos:** horizontal scroll on mobile, flex row on md+
- **Long Videos:** grid-cols-1 → grid-cols-2
- **Services:** stack on mobile (no sticky), split layout on lg+
- **Skills marquee:** smaller text on mobile, same infinite scroll
- **Testimonials:** single card on mobile, 3 visible on lg+
- **Pricing:** stack on mobile, grid-cols-3 on lg+
- **FAQ:** stack on mobile, 2-col on lg+

## Image & Media Optimization
- No actual images in MVP — gradient placeholder divs with Lucide Play icon
- When images are added later: use next/image with width/height for CLS prevention
- Video embeds: render only thumbnails, load iframe on click (lite-embed pattern)
- Avatar placeholders: CSS gradient circles

## Lazy Loading
- **Hero:** eager load (above fold)
- **RecentEdits:** eager (likely above fold on desktop)
- **ShortVideos and below:** lazy via Framer Motion viewport detection
- **Embla Carousel:** import normally (2KB, not worth dynamic import overhead)
- **Admin panel:** entire /admin tree is separate route, won't affect main bundle
- **Framer Motion:** import { motion, AnimatePresence, useScroll, useTransform } — tree-shakeable

## Rendering Strategy
- **Homepage (/):** Static generation with ISR (revalidate: 60) when Firebase connected; pure SSG when seed.json only
- **API routes:** Serverless functions (Edge-compatible for simple GET routes)
- **Admin (/admin/*):** Client-side rendering ("use client" throughout)
- **Seed data fallback:** Imported at build time for SSG, no runtime cost

## Core Web Vitals Targets
| Metric | Target | Strategy |
|--------|--------|----------|
| LCP | < 2.5s | Hero text renders immediately (no data fetch), fonts preloaded |
| INP | < 100ms | Minimal JS on initial paint, animations are CSS/GPU-only |
| CLS | < 0.1 | All placeholders have explicit dimensions, font-display: swap |

## Bundle Optimization
- Framer Motion: ~30KB gzipped (tree-shaken), acceptable for animation needs
- Embla Carousel: ~2KB gzipped
- Lucide React: individual icon imports (~200B per icon)
- Tailwind: purges unused styles in production
- next/font: automatic font subsetting and optimization
- Total estimated JS: ~80KB gzipped first load

## Font Loading
```typescript
// next/font/google in layout.tsx
import { Playfair_Display, Inter } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});
```

## Animation Performance
- Skills marquee: pure CSS (translateX), will-change: transform
- Service card rotation: GPU-composited transform, one useScroll per card
- Carousels: Embla handles its own performant transforms
- All hover effects: transform + opacity only
- prefers-reduced-motion: disables transforms, keeps opacity fades
