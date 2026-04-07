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

export interface SiteConfig {
  readonly hero: {
    readonly headline: string;
    readonly subtitle: string;
    readonly ctaText: string;
    readonly socialProofText: string;
  };
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
}

export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}
