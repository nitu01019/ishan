// TODO: add zod to deps via WS-1 aggregator
import { z } from "zod";

// --- Video ---
const videoBaseShape = {
  title: z.string().min(1),
  description: z.string().optional(),
  thumbnailUrl: z.string(),
  videoUrl: z.string(),
  category: z.enum(["recent", "short", "long"]),
  creatorName: z.string(),
  viewCount: z.string(),
  duration: z.string(),
  platform: z.enum(["youtube", "vimeo", "tiktok", "instagram"]),
  order: z.number().int(),
  createdAt: z.string(),
  isVisible: z.boolean(),
};

export const videoCreateSchema = z
  .object({
    ...videoBaseShape,
    title: z.string().min(1),
    category: z.enum(["recent", "short", "long"]),
    description: videoBaseShape.description,
    thumbnailUrl: videoBaseShape.thumbnailUrl.optional(),
    videoUrl: videoBaseShape.videoUrl.optional(),
    creatorName: videoBaseShape.creatorName.optional(),
    viewCount: videoBaseShape.viewCount.optional(),
    duration: videoBaseShape.duration.optional(),
    platform: videoBaseShape.platform.optional(),
    order: videoBaseShape.order.optional(),
    createdAt: videoBaseShape.createdAt.optional(),
    isVisible: videoBaseShape.isVisible.optional(),
  })
  .strict();

export const videoUpdateSchema = z
  .object({
    title: videoBaseShape.title.optional(),
    description: videoBaseShape.description,
    thumbnailUrl: videoBaseShape.thumbnailUrl.optional(),
    videoUrl: videoBaseShape.videoUrl.optional(),
    category: videoBaseShape.category.optional(),
    creatorName: videoBaseShape.creatorName.optional(),
    viewCount: videoBaseShape.viewCount.optional(),
    duration: videoBaseShape.duration.optional(),
    platform: videoBaseShape.platform.optional(),
    order: videoBaseShape.order.optional(),
    createdAt: videoBaseShape.createdAt.optional(),
    isVisible: videoBaseShape.isVisible.optional(),
  })
  .strict();

// --- Testimonial ---
const testimonialBaseShape = {
  quote: z.string().min(1),
  clientName: z.string().min(1),
  clientRole: z.string(),
  clientAvatar: z.string(),
  rating: z.number().min(1).max(5),
  order: z.number().int(),
  isVisible: z.boolean(),
  createdAt: z.string(),
};

export const testimonialCreateSchema = z
  .object({
    quote: testimonialBaseShape.quote,
    clientName: testimonialBaseShape.clientName,
    clientRole: testimonialBaseShape.clientRole.optional(),
    clientAvatar: testimonialBaseShape.clientAvatar.optional(),
    rating: testimonialBaseShape.rating,
    order: testimonialBaseShape.order.optional(),
    isVisible: testimonialBaseShape.isVisible.optional(),
    createdAt: testimonialBaseShape.createdAt.optional(),
  })
  .strict();

export const testimonialUpdateSchema = z
  .object({
    quote: testimonialBaseShape.quote.optional(),
    clientName: testimonialBaseShape.clientName.optional(),
    clientRole: testimonialBaseShape.clientRole.optional(),
    clientAvatar: testimonialBaseShape.clientAvatar.optional(),
    rating: testimonialBaseShape.rating.optional(),
    order: testimonialBaseShape.order.optional(),
    isVisible: testimonialBaseShape.isVisible.optional(),
    createdAt: testimonialBaseShape.createdAt.optional(),
  })
  .strict();

// --- Pricing ---
const pricingBaseShape = {
  planName: z.string().min(1),
  price: z.number().min(0),
  period: z.string(),
  features: z.array(z.string()).min(1),
  isHighlighted: z.boolean(),
  order: z.number().int(),
  isVisible: z.boolean(),
  createdAt: z.string(),
};

export const pricingCreateSchema = z
  .object({
    planName: pricingBaseShape.planName,
    price: pricingBaseShape.price,
    period: pricingBaseShape.period.optional(),
    features: pricingBaseShape.features,
    isHighlighted: pricingBaseShape.isHighlighted.optional(),
    order: pricingBaseShape.order.optional(),
    isVisible: pricingBaseShape.isVisible.optional(),
    createdAt: pricingBaseShape.createdAt.optional(),
  })
  .strict();

export const pricingUpdateSchema = z
  .object({
    planName: pricingBaseShape.planName.optional(),
    price: pricingBaseShape.price.optional(),
    period: pricingBaseShape.period.optional(),
    features: pricingBaseShape.features.optional(),
    isHighlighted: pricingBaseShape.isHighlighted.optional(),
    order: pricingBaseShape.order.optional(),
    isVisible: pricingBaseShape.isVisible.optional(),
    createdAt: pricingBaseShape.createdAt.optional(),
  })
  .strict();

// --- Service ---
const serviceBaseShape = {
  title: z.string().min(1),
  description: z.string().min(1),
  order: z.number().int(),
  isVisible: z.boolean(),
  createdAt: z.string(),
};

export const serviceCreateSchema = z
  .object({
    title: serviceBaseShape.title,
    description: serviceBaseShape.description,
    order: serviceBaseShape.order.optional(),
    isVisible: serviceBaseShape.isVisible.optional(),
    createdAt: serviceBaseShape.createdAt.optional(),
  })
  .strict();

export const serviceUpdateSchema = z
  .object({
    title: serviceBaseShape.title.optional(),
    description: serviceBaseShape.description.optional(),
    order: serviceBaseShape.order.optional(),
    isVisible: serviceBaseShape.isVisible.optional(),
    createdAt: serviceBaseShape.createdAt.optional(),
  })
  .strict();

// --- FAQ ---
const faqBaseShape = {
  question: z.string().min(1),
  answer: z.string().min(1),
  order: z.number().int(),
  isVisible: z.boolean(),
  createdAt: z.string(),
};

export const faqCreateSchema = z
  .object({
    question: faqBaseShape.question,
    answer: faqBaseShape.answer,
    order: faqBaseShape.order.optional(),
    isVisible: faqBaseShape.isVisible.optional(),
    createdAt: faqBaseShape.createdAt.optional(),
  })
  .strict();

export const faqUpdateSchema = z
  .object({
    question: faqBaseShape.question.optional(),
    answer: faqBaseShape.answer.optional(),
    order: faqBaseShape.order.optional(),
    isVisible: faqBaseShape.isVisible.optional(),
    createdAt: faqBaseShape.createdAt.optional(),
  })
  .strict();

// --- Inquiry (PATCH only — admin can mark read/etc.) ---
export const inquiryUpdateSchema = z
  .object({
    isRead: z.boolean().optional(),
  })
  .strict();

// --- SiteConfig (partial deep) ---
const sectionBackgroundSchema = z
  .object({
    type: z.enum(["solid", "gradient", "image"]).optional(),
    color: z.string().optional(),
    gradientFrom: z.string().optional(),
    gradientTo: z.string().optional(),
    gradientDirection: z.string().optional(),
    imageUrl: z.string().optional(),
    opacity: z.number().optional(),
  })
  .strict();

const themeConfigSchema = z
  .object({
    accentColor: z.string().optional(),
    accentTeal: z.string().optional(),
    accentCyan: z.string().optional(),
    bgPrimary: z.string().optional(),
    bgCard: z.string().optional(),
    bgCardAlt: z.string().optional(),
    textPrimary: z.string().optional(),
    textSecondary: z.string().optional(),
  })
  .strict();

const layoutConfigSchema = z
  .object({
    testimonials: z.enum(["cards", "carousel", "grid", "masonry"]).optional(),
    pricing: z.enum(["cards", "comparison", "stacked"]).optional(),
    services: z.enum(["cards", "timeline", "icons-grid"]).optional(),
    videos: z.enum(["grid", "carousel", "featured"]).optional(),
  })
  .strict();

const animationConfigSchema = z
  .object({
    cardEntrance: z
      .enum(["fade-up", "slide-in", "scale", "flip", "none"])
      .optional(),
    buttonHover: z.enum(["glow", "lift", "pulse", "none"]).optional(),
    scrollAnimations: z.boolean().optional(),
    scrollSpeed: z.enum(["slow", "medium", "fast"]).optional(),
  })
  .strict();

const navConfigSchema = z
  .object({
    style: z.enum(["solid", "glass", "minimal"]).optional(),
    transparent: z.boolean().optional(),
    opacity: z.number().optional(),
    sticky: z.boolean().optional(),
    logoText: z.string().optional(),
    ctaText: z.string().optional(),
    bgColor: z.string().optional(),
  })
  .strict();

const typographyConfigSchema = z
  .object({
    headingFont: z.string().optional(),
    bodyFont: z.string().optional(),
    baseFontSize: z.number().optional(),
    headingScale: z.number().optional(),
  })
  .strict();

const heroConfigSchema = z
  .object({
    headline: z.string().optional(),
    subtitle: z.string().optional(),
    ctaText: z.string().optional(),
    socialProofText: z.string().optional(),
    robotPosition: z.enum(["left", "right"]).optional(),
    rotatingWords: z.array(z.string()).optional(),
    secondaryCtaText: z.string().optional(),
    showSpline: z.boolean().optional(),
    background: sectionBackgroundSchema.optional(),
  })
  .strict();

const preloaderConfigSchema = z
  .object({
    enabled: z.boolean().optional(),
    portfolioName: z.string().optional(),
    loadingMessage: z.string().optional(),
  })
  .strict();

const footerSchema = z
  .object({
    name: z.string().optional(),
    tagline: z.string().optional(),
    socials: z
      .object({
        linkedin: z.string().optional(),
        instagram: z.string().optional(),
        twitter: z.string().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

const sectionBackgroundsSchema = z
  .object({
    hero: sectionBackgroundSchema.optional(),
    videos: sectionBackgroundSchema.optional(),
    testimonials: sectionBackgroundSchema.optional(),
    pricing: sectionBackgroundSchema.optional(),
    services: sectionBackgroundSchema.optional(),
    contact: sectionBackgroundSchema.optional(),
    faq: sectionBackgroundSchema.optional(),
    workflow: sectionBackgroundSchema.optional(),
    skills: sectionBackgroundSchema.optional(),
  })
  .strict();

export const siteConfigUpdateSchema = z
  .object({
    brandName: z.string().optional(),
    hero: heroConfigSchema.optional(),
    skills: z.array(z.string()).optional(),
    footer: footerSchema.optional(),
    bookingLink: z.string().optional(),
    theme: themeConfigSchema.optional(),
    typography: typographyConfigSchema.optional(),
    preloader: preloaderConfigSchema.optional(),
    navbar: navConfigSchema.optional(),
    layouts: layoutConfigSchema.optional(),
    animations: animationConfigSchema.optional(),
    sectionBackgrounds: sectionBackgroundsSchema.optional(),
  })
  .strict();
