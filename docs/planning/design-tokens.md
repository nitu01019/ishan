# Design Tokens — Video Editor Portfolio

## Color Palette

### CSS Custom Properties
```css
:root {
  --bg-primary: #0B1120;
  --bg-card: #111827;
  --bg-card-alt: #1E293B;
  --accent-green: #00E676;
  --accent-teal: #00BFA5;
  --accent-cyan: #26C6DA;
  --text-primary: #FFFFFF;
  --text-secondary: #9CA3AF;
  --text-muted: #6B7280;
  --border-glow: rgba(0, 230, 118, 0.15);
  --border-glow-hover: rgba(0, 230, 118, 0.4);
  --star-orange: #F59E0B;
  --gradient-green: linear-gradient(135deg, #00E676 0%, #00BFA5 50%, #26C6DA 100%);
  --shadow-green: 0 4px 30px rgba(0, 230, 118, 0.15);
  --shadow-green-lg: 0 8px 40px rgba(0, 230, 118, 0.25);
}
```

## Typography Scale

| Element | Font | Weight | Mobile | Tablet | Desktop |
|---------|------|--------|--------|--------|---------|
| H1 | Playfair Display | 700 | 36px/2.25rem | 48px/3rem | 64px/4rem |
| H2 | Playfair Display | 700 | 32px/2rem | 40px/2.5rem | 48px/3rem |
| H3 | Inter | 700 | 20px/1.25rem | 22px/1.375rem | 24px/1.5rem |
| Body | Inter | 400 | 15px/0.9375rem | 16px/1rem | 16px/1rem |
| Body-sm | Inter | 400 | 13px/0.8125rem | 14px/0.875rem | 14px/0.875rem |
| Button | Inter | 600 | 14px/0.875rem | 16px/1rem | 16px/1rem |
| Nav | Inter | 500 | 16px/1rem | 15px | 15px |

## Spacing Scale
- Section padding: py-16 (mobile) → py-20 (tablet) → py-24 (desktop)
- Container: px-4 (mobile) → px-6 (tablet) → px-8 (desktop), max-w-7xl mx-auto
- Card padding: p-4 (mobile) → p-6 (desktop)
- Grid gaps: gap-4 (mobile) → gap-6 (desktop)
- Component gaps: gap-2, gap-3, gap-4, gap-6, gap-8, gap-12

## Shadows
```
shadow-card: 0 2px 16px rgba(0, 0, 0, 0.3)
shadow-card-hover: 0 4px 24px rgba(0, 0, 0, 0.4)
shadow-green: 0 4px 30px rgba(0, 230, 118, 0.15)
shadow-green-lg: 0 8px 40px rgba(0, 230, 118, 0.25)
shadow-green-xl: 0 12px 50px rgba(0, 230, 118, 0.3)
```

## Gradients
```
gradient-green: linear-gradient(135deg, #00E676 0%, #00BFA5 50%, #26C6DA 100%)
gradient-hero-glow: radial-gradient(ellipse at 50% 0%, rgba(0,230,118,0.12) 0%, transparent 60%)
gradient-fade-left: linear-gradient(to right, #0B1120 0%, transparent 10%)
gradient-fade-right: linear-gradient(to left, #0B1120 0%, transparent 10%)
```

## Border Radius
- Cards: 16px (rounded-2xl)
- Pill buttons: 9999px (rounded-full)
- Rectangular buttons: 12px (rounded-xl)
- Avatar: 9999px (rounded-full)
- Input fields: 12px (rounded-xl)

## Breakpoints
| Name | Width | Tailwind Prefix |
|------|-------|-----------------|
| Mobile | 0–767px | default |
| Tablet | 768px+ | md: |
| Desktop | 1024px+ | lg: |
| Large | 1280px+ | xl: |

## Tailwind Config Mapping
All tokens map to `tailwind.config.ts` extend:
- colors.bg.primary, colors.bg.card, colors.bg.card-alt
- colors.accent.green, colors.accent.teal, colors.accent.cyan
- colors.text.primary, colors.text.secondary, colors.text.muted
- colors.border.glow, colors.border.glow-hover
- colors.star.orange
- boxShadow.card, boxShadow.card-hover, boxShadow.green, boxShadow.green-lg
- fontFamily.heading (Playfair Display), fontFamily.body (Inter)
