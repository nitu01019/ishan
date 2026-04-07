# Animation Specifications — Video Editor Portfolio

## Framer Motion Variants

### Hero Stagger
```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};
```

### Scroll Fade-In (reusable for most sections)
```typescript
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};
// Usage: whileInView="visible" initial="hidden" viewport={{ once: true, amount: 0.3 }}
```

### Staggered Grid (Short Videos, Long Videos)
```typescript
const gridContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const gridItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};
```

### Service Cards (scroll-linked rotation)
```typescript
// Per card, using useScroll + useTransform
const { scrollYProgress } = useScroll({
  target: cardRef,
  offset: ["start end", "center center"]
});

const rotate = useTransform(scrollYProgress, [0, 1], [initialRotation, 0]);
const opacity = useTransform(scrollYProgress, [0, 0.3], [0.6, 1]);

// Initial rotations per card:
// Card 1: -6deg → 0deg
// Card 2: -3deg → 0deg
// Card 3: 2deg → 0deg
// Card 4: 5deg → 0deg

// Spring config for smooth feel:
const springConfig = { type: "spring", stiffness: 100, damping: 20 };
```

### Pricing Pop-In
```typescript
const pricingItem = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};
```

### FAQ Accordion
```typescript
// Uses AnimatePresence + motion.div
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    />
  )}
</AnimatePresence>

// Plus icon rotation:
<motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }} />
```

## CSS Animations

### Skills Marquee
```css
@keyframes scroll-left {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes scroll-right {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}

.marquee-left {
  animation: scroll-left 30s linear infinite;
}

.marquee-right {
  animation: scroll-right 35s linear infinite;
}

.marquee-row:hover .marquee-left,
.marquee-row:hover .marquee-right {
  animation-play-state: paused;
}
```

### Hero Glow Pulse
```css
@keyframes glow-pulse {
  0%, 100% { opacity: 0.08; }
  50% { opacity: 0.15; }
}

.hero-glow {
  animation: glow-pulse 4s ease-in-out infinite;
}
```

### Navbar Transition
```css
.navbar-scrolled {
  backdrop-filter: blur(12px);
  background-color: rgba(11, 17, 32, 0.8);
  transition: all 300ms ease;
}
```

## Hover Animations (Tailwind + inline)
- Video cards: `hover:-translate-y-1 hover:shadow-green transition-all duration-200`
- Pricing cards: `hover:-translate-y-1 transition-transform duration-200`
- Professional pricing: permanent `-translate-y-2 shadow-green-lg`
- Buttons: `hover:brightness-110 active:scale-95 transition-all duration-150`
- Nav links: `hover:text-accent-green transition-colors duration-200`
- Social icons: `hover:bg-accent-green hover:text-black transition-colors duration-200`

## Reduced Motion
```typescript
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

// When reduced motion is preferred:
// - Disable all transform animations (y, scale, rotate)
// - Keep opacity transitions (accessible)
// - Pause marquee
// - Disable auto-advance on carousels
```

## Performance Notes
- Use `transform` and `opacity` only (GPU-composited)
- Add `will-change: transform` to marquee rows and carousel slides
- Service cards: single useScroll per card, not per-pixel recalculation
- Intersection Observer (via Framer Motion viewport) uses `once: true` to fire animations once
- Embla Carousel handles its own performant scroll calculations
