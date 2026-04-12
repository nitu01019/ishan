import { supabase, isSupabaseConfigured } from "./supabase";
import seedData from "@/data/seed.json";
import { getVisualDefaults } from "./visual-config-defaults";

import type {
  Video,
  Testimonial,
  Service,
  PricingPlan,
  FAQ,
  Inquiry,
  SiteConfig,
} from "@/types";

export { getVisualDefaults } from "./visual-config-defaults";

function sortByOrder<T extends { readonly order: number }>(
  items: readonly T[]
): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export async function getVideos(category?: string, includeHidden = false): Promise<Video[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let q = supabase.from("videos").select("*");
      if (!includeHidden) q = q.eq("isVisible", true);
      if (category) q = q.eq("category", category);
      q = q.order("order", { ascending: true });
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Video[];
    } catch {
      // Fall back to seed data on Supabase error
    }
  }

  const videos = seedData.videos as unknown as Video[];
  const filtered = includeHidden ? videos : videos.filter((v) => v.isVisible);
  const byCategory = category
    ? filtered.filter((v) => v.category === category)
    : filtered;
  return sortByOrder(byCategory);
}

export async function getTestimonials(includeHidden = false): Promise<Testimonial[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let q = supabase.from("testimonials").select("*");
      if (!includeHidden) q = q.eq("isVisible", true);
      q = q.order("order", { ascending: true });
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Testimonial[];
    } catch {
      // Fall back to seed data on Supabase error
    }
  }

  const testimonials = seedData.testimonials as unknown as Testimonial[];
  const filtered = includeHidden ? testimonials : testimonials.filter((t) => t.isVisible);
  return sortByOrder(filtered);
}

export async function getServices(includeHidden = false): Promise<Service[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let q = supabase.from("services").select("*");
      if (!includeHidden) q = q.eq("isVisible", true);
      q = q.order("order", { ascending: true });
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Service[];
    } catch {
      // Fall back to seed data on Supabase error
    }
  }

  const services = seedData.services as unknown as Service[];
  const filtered = includeHidden ? services : services.filter((s) => s.isVisible);
  return sortByOrder(filtered);
}

export async function getPricing(includeHidden = false): Promise<PricingPlan[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let q = supabase.from("pricing").select("*");
      if (!includeHidden) q = q.eq("isVisible", true);
      q = q.order("order", { ascending: true });
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as PricingPlan[];
    } catch {
      // Fall back to seed data on Supabase error
    }
  }

  const pricing = seedData.pricing as unknown as PricingPlan[];
  return sortByOrder(pricing);
}

export async function getFAQs(includeHidden = false): Promise<FAQ[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let q = supabase.from("faqs").select("*");
      if (!includeHidden) q = q.eq("isVisible", true);
      q = q.order("order", { ascending: true });
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as FAQ[];
    } catch {
      // Fall back to seed data on Supabase error
    }
  }

  const faqs = seedData.faqs as unknown as FAQ[];
  const filtered = includeHidden ? faqs : faqs.filter((f) => f.isVisible);
  return sortByOrder(filtered);
}

export async function getSiteConfig(): Promise<SiteConfig> {
  let raw: SiteConfig;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("site_config")
        .select("config")
        .eq("id", "main")
        .single();
      if (error) throw error;
      if (data?.config) {
        raw = data.config as SiteConfig;
      } else {
        raw = seedData.siteConfig as unknown as SiteConfig;
      }
    } catch {
      // Fall back to seed data on Supabase error
      raw = seedData.siteConfig as unknown as SiteConfig;
    }
  } else {
    raw = seedData.siteConfig as unknown as SiteConfig;
  }

  // Merge visual defaults so components always have complete values
  // even when new fields are missing from the database or seed data.
  const defaults = getVisualDefaults();
  return {
    ...raw,
    navbar: raw.navbar
      ? { ...defaults.navbar, ...raw.navbar }
      : defaults.navbar,
    typography: raw.typography
      ? { ...defaults.typography, ...raw.typography }
      : defaults.typography,
    layouts: raw.layouts
      ? { ...defaults.layouts, ...raw.layouts }
      : defaults.layouts,
    animations: raw.animations
      ? { ...defaults.animations, ...raw.animations }
      : defaults.animations,
    preloader: raw.preloader
      ? { ...defaults.preloader, ...raw.preloader }
      : defaults.preloader,
    sectionBackgrounds: raw.sectionBackgrounds
      ? {
          hero: raw.sectionBackgrounds.hero
            ? { ...defaults.sectionBackgrounds.hero, ...raw.sectionBackgrounds.hero }
            : defaults.sectionBackgrounds.hero,
          videos: raw.sectionBackgrounds.videos
            ? { ...defaults.sectionBackgrounds.videos, ...raw.sectionBackgrounds.videos }
            : defaults.sectionBackgrounds.videos,
          testimonials: raw.sectionBackgrounds.testimonials
            ? { ...defaults.sectionBackgrounds.testimonials, ...raw.sectionBackgrounds.testimonials }
            : defaults.sectionBackgrounds.testimonials,
          pricing: raw.sectionBackgrounds.pricing
            ? { ...defaults.sectionBackgrounds.pricing, ...raw.sectionBackgrounds.pricing }
            : defaults.sectionBackgrounds.pricing,
          services: raw.sectionBackgrounds.services
            ? { ...defaults.sectionBackgrounds.services, ...raw.sectionBackgrounds.services }
            : defaults.sectionBackgrounds.services,
          contact: raw.sectionBackgrounds.contact
            ? { ...defaults.sectionBackgrounds.contact, ...raw.sectionBackgrounds.contact }
            : defaults.sectionBackgrounds.contact,
          faq: raw.sectionBackgrounds.faq
            ? { ...defaults.sectionBackgrounds.faq, ...raw.sectionBackgrounds.faq }
            : defaults.sectionBackgrounds.faq,
          workflow: raw.sectionBackgrounds.workflow
            ? { ...defaults.sectionBackgrounds.workflow, ...raw.sectionBackgrounds.workflow }
            : defaults.sectionBackgrounds.workflow,
          skills: raw.sectionBackgrounds.skills
            ? { ...defaults.sectionBackgrounds.skills, ...raw.sectionBackgrounds.skills }
            : defaults.sectionBackgrounds.skills,
        }
      : defaults.sectionBackgrounds,
  };
}

const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (DANGEROUS_KEYS.has(key)) continue;
    const srcVal = source[key];
    const tgtVal = target[key];
    if (
      srcVal !== null &&
      typeof srcVal === "object" &&
      !Array.isArray(srcVal) &&
      tgtVal !== null &&
      typeof tgtVal === "object" &&
      !Array.isArray(tgtVal)
    ) {
      result[key] = deepMerge(
        tgtVal as Record<string, unknown>,
        srcVal as Record<string, unknown>
      );
    } else {
      result[key] = srcVal;
    }
  }
  return result;
}

export async function updateSiteConfig(
  updates: Record<string, unknown>
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  const current = await getSiteConfig();
  const merged = deepMerge(
    current as unknown as Record<string, unknown>,
    updates
  );

  const { error } = await supabase
    .from("site_config")
    .upsert({ id: "main", config: merged });

  if (error) throw error;
}

export async function createItem(
  collectionName: string,
  data: Record<string, unknown>
): Promise<string> {
  if (!isSupabaseConfigured || !supabase) {
    return "";
  }

  const id =
    (data.id as string | undefined) ??
    `${collectionName}_${Date.now()}`;

  const { error } = await supabase
    .from(collectionName)
    .insert({ ...data, id });

  if (error) throw error;
  return id;
}

export async function updateItem(
  collectionName: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  const { error } = await supabase
    .from(collectionName)
    .update({ ...data, id })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteItem(
  collectionName: string,
  id: string
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  const { error } = await supabase
    .from(collectionName)
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function getInquiries(): Promise<Inquiry[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("createdAt", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Inquiry[];
    } catch {
      // Fall back to seed data
    }
  }
  const inquiries = (seedData as Record<string, unknown>).inquiries as unknown as Inquiry[] | undefined;
  return inquiries ?? [];
}

export async function createInquiry(data: Omit<Inquiry, "id" | "createdAt" | "isRead">): Promise<string> {
  const id = `inq_${Date.now()}`;
  const inquiry = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from("inquiries")
      .insert(inquiry);
    if (error) throw error;
    return id;
  }

  return id;
}
