import type {
  SectionBackground,
  LayoutConfig,
  AnimationConfig,
  NavConfig,
  TypographyConfig,
  HeroConfig,
  PreloaderConfig,
  SiteConfig,
} from "@/types";

/**
 * Default section background -- transparent solid, no visual change.
 */
export const defaultSectionBackground: SectionBackground = {
  type: "solid",
  color: "#0B1120",
  gradientFrom: "#0B1120",
  gradientTo: "#111827",
  gradientDirection: "to-br",
  imageUrl: "",
  opacity: 100,
} as const;

/**
 * Default layout variants -- matches the current hardcoded component layouts.
 */
export const defaultLayoutConfig: LayoutConfig = {
  testimonials: "carousel",
  pricing: "cards",
  services: "cards",
  videos: "grid",
} as const;

/**
 * Default animation config -- matches the current Framer Motion behavior.
 */
export const defaultAnimationConfig: AnimationConfig = {
  cardEntrance: "fade-up",
  buttonHover: "glow",
  scrollAnimations: true,
  scrollSpeed: "medium",
} as const;

/**
 * Default navbar config -- matches the current glass-style sticky nav.
 */
export const defaultNavConfig: NavConfig = {
  style: "glass",
  transparent: true,
  opacity: 3,
  sticky: true,
  logoText: "Neal",
  ctaText: "Hire me",
} as const;

/**
 * Default typography config -- matches Playfair Display + Inter from layout.tsx.
 */
export const defaultTypographyConfig: TypographyConfig = {
  headingFont: "Playfair Display",
  bodyFont: "Inter",
  baseFontSize: 16,
  headingScale: 1.25,
} as const;

/**
 * Default hero config -- matches the current Hero component hardcoded values.
 */
export const defaultHeroConfig: HeroConfig = {
  headline: "Unleash Your {word} Potential With Pro Video Editing",
  subtitle:
    "We transform raw footage into captivating content that gets seen, shared, and loved. Take your channel to the next level with our expert editing magic.",
  ctaText: "Hire me",
  socialProofText: "Worked with 50+ clients",
  robotPosition: "right",
  rotatingWords: ["Viral", "Stunning", "Cinematic", "Creative", "Powerful"],
  secondaryCtaText: "See portfolio",
  showSpline: true,
  background: { ...defaultSectionBackground },
} as const;

/**
 * Default preloader config -- matches the current Preloader component.
 */
export const defaultPreloaderConfig: PreloaderConfig = {
  enabled: true,
  portfolioName: "Neal's portfolio",
  loadingMessage: "Getting Neal's portfolio for you",
} as const;

/**
 * Default section backgrounds -- all use the base transparent solid.
 */
export const defaultSectionBackgrounds: NonNullable<SiteConfig["sectionBackgrounds"]> = {
  hero: { ...defaultSectionBackground },
  videos: { ...defaultSectionBackground },
  testimonials: { ...defaultSectionBackground },
  pricing: { ...defaultSectionBackground },
  services: { ...defaultSectionBackground },
  contact: { ...defaultSectionBackground },
  faq: { ...defaultSectionBackground },
  workflow: { ...defaultSectionBackground },
  skills: { ...defaultSectionBackground },
} as const;

/**
 * Complete set of visual defaults for all new config fields.
 * Merging these into any partial SiteConfig ensures components
 * always have complete values without breaking existing data.
 */
export const visualConfigDefaults = {
  navbar: defaultNavConfig,
  typography: defaultTypographyConfig,
  layouts: defaultLayoutConfig,
  animations: defaultAnimationConfig,
  sectionBackgrounds: defaultSectionBackgrounds,
  preloader: defaultPreloaderConfig,
} as const;

/**
 * Returns a fresh copy of all visual defaults.
 */
export function getVisualDefaults(): typeof visualConfigDefaults {
  return {
    navbar: { ...defaultNavConfig },
    typography: { ...defaultTypographyConfig },
    layouts: { ...defaultLayoutConfig },
    animations: { ...defaultAnimationConfig },
    sectionBackgrounds: {
      hero: { ...defaultSectionBackground },
      videos: { ...defaultSectionBackground },
      testimonials: { ...defaultSectionBackground },
      pricing: { ...defaultSectionBackground },
      services: { ...defaultSectionBackground },
      contact: { ...defaultSectionBackground },
      faq: { ...defaultSectionBackground },
      workflow: { ...defaultSectionBackground },
      skills: { ...defaultSectionBackground },
    },
    preloader: { ...defaultPreloaderConfig },
  };
}
