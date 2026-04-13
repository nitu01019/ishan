export interface Video {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly thumbnailUrl: string;
  readonly videoUrl: string;
  readonly category: "recent" | "short" | "long";
  readonly creatorName: string;
  readonly viewCount: string;
  readonly duration: string;
  readonly platform: "youtube" | "vimeo" | "tiktok" | "instagram";
  readonly order: number;
  readonly createdAt: string;
  readonly isVisible: boolean;
}

export interface Testimonial {
  readonly id: string;
  readonly quote: string;
  readonly clientName: string;
  readonly clientRole: string;
  readonly clientAvatar: string;
  readonly rating: number;
  readonly order: number;
  readonly isVisible: boolean;
}

export interface Service {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly order: number;
  readonly isVisible: boolean;
}

export interface PricingPlan {
  readonly id: string;
  readonly planName: string;
  readonly price: number;
  readonly period: string;
  readonly features: readonly string[];
  readonly isHighlighted: boolean;
  readonly order: number;
  readonly isVisible: boolean;
}

export interface FAQ {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  readonly order: number;
  readonly isVisible: boolean;
}

export interface Inquiry {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly projectType: "short-form" | "long-form" | "thumbnail" | "seo" | "consulting" | "other";
  readonly budget: string;
  readonly message: string;
  readonly selectedPlan: string;
  readonly createdAt: string;
  readonly isRead: boolean;
}

export interface ThemeConfig {
  readonly accentColor: string;
  readonly accentTeal: string;
  readonly accentCyan: string;
  readonly bgPrimary: string;
  readonly bgCard: string;
  readonly bgCardAlt: string;
  readonly textPrimary: string;
  readonly textSecondary: string;
}

export interface SectionBackground {
  readonly type: 'solid' | 'gradient' | 'image';
  readonly color: string;
  readonly gradientFrom: string;
  readonly gradientTo: string;
  readonly gradientDirection: string;
  readonly imageUrl: string;
  readonly opacity: number;
}

export interface LayoutConfig {
  readonly testimonials: 'cards' | 'carousel' | 'grid' | 'masonry';
  readonly pricing: 'cards' | 'comparison' | 'stacked';
  readonly services: 'cards' | 'timeline' | 'icons-grid';
  readonly videos: 'grid' | 'carousel' | 'featured';
}

export interface AnimationConfig {
  readonly cardEntrance: 'fade-up' | 'slide-in' | 'scale' | 'flip' | 'none';
  readonly buttonHover: 'glow' | 'lift' | 'pulse' | 'none';
  readonly scrollAnimations: boolean;
  readonly scrollSpeed: 'slow' | 'medium' | 'fast';
}

export interface NavConfig {
  readonly style: 'solid' | 'glass' | 'minimal';
  readonly transparent: boolean;
  readonly opacity: number;
  readonly sticky: boolean;
  readonly logoText: string;
  readonly ctaText: string;
  readonly bgColor?: string;
}

export interface TypographyConfig {
  readonly headingFont: string;
  readonly bodyFont: string;
  readonly baseFontSize: number;
  readonly headingScale: number;
}

export interface HeroConfig {
  readonly headline: string;
  readonly subtitle: string;
  readonly ctaText: string;
  readonly socialProofText: string;
  readonly robotPosition?: 'left' | 'right';
  readonly rotatingWords?: readonly string[];
  readonly secondaryCtaText?: string;
  readonly showSpline?: boolean;
  readonly background?: SectionBackground;
}

export interface PreloaderConfig {
  readonly enabled: boolean;
  readonly portfolioName?: string;
  readonly loadingMessage: string;
}

export interface SiteConfig {
  readonly brandName?: string;
  readonly hero: HeroConfig;
  readonly skills: readonly string[];
  readonly footer: {
    readonly name: string;
    readonly tagline: string;
    readonly socials: {
      readonly linkedin: string;
      readonly instagram: string;
      readonly twitter: string;
    };
  };
  readonly bookingLink: string;
  readonly theme?: ThemeConfig;
  readonly typography?: TypographyConfig;
  readonly preloader?: PreloaderConfig;
  readonly navbar?: NavConfig;
  readonly layouts?: LayoutConfig;
  readonly animations?: AnimationConfig;
  readonly sectionBackgrounds?: {
    readonly hero?: SectionBackground;
    readonly videos?: SectionBackground;
    readonly testimonials?: SectionBackground;
    readonly pricing?: SectionBackground;
    readonly services?: SectionBackground;
    readonly contact?: SectionBackground;
    readonly faq?: SectionBackground;
    readonly workflow?: SectionBackground;
    readonly skills?: SectionBackground;
  };
}

export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}
