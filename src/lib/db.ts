import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import seedData from "@/data/seed.json";
import { db, isFirebaseConfigured } from "./firebase";

import type {
  Video,
  Testimonial,
  Service,
  PricingPlan,
  FAQ,
  Inquiry,
  SiteConfig,
} from "@/types";

function sortByOrder<T extends { readonly order: number }>(
  items: readonly T[]
): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export async function getVideos(category?: string, includeHidden = false): Promise<Video[]> {
  if (isFirebaseConfigured && db) {
    try {
      const videosRef = collection(db, "videos");
      const constraints = [
        ...(includeHidden ? [] : [where("isVisible", "==", true)]),
        ...(category ? [where("category", "==", category)] : []),
        orderBy("order", "asc"),
      ];
      const q = query(videosRef, ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Video);
    } catch {
      // Fall back to seed data on Firebase error
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
  if (isFirebaseConfigured && db) {
    try {
      const ref = collection(db, "testimonials");
      const constraints = [
        ...(includeHidden ? [] : [where("isVisible", "==", true)]),
        orderBy("order", "asc"),
      ];
      const q = query(ref, ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (d) => ({ ...d.data(), id: d.id }) as Testimonial
      );
    } catch {
      // Fall back to seed data on Firebase error
    }
  }

  const testimonials = seedData.testimonials as unknown as Testimonial[];
  const filtered = includeHidden ? testimonials : testimonials.filter((t) => t.isVisible);
  return sortByOrder(filtered);
}

export async function getServices(includeHidden = false): Promise<Service[]> {
  if (isFirebaseConfigured && db) {
    try {
      const ref = collection(db, "services");
      const constraints = [
        ...(includeHidden ? [] : [where("isVisible", "==", true)]),
        orderBy("order", "asc"),
      ];
      const q = query(ref, ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Service);
    } catch {
      // Fall back to seed data on Firebase error
    }
  }

  const services = seedData.services as unknown as Service[];
  const filtered = includeHidden ? services : services.filter((s) => s.isVisible);
  return sortByOrder(filtered);
}

export async function getPricing(includeHidden = false): Promise<PricingPlan[]> {
  if (isFirebaseConfigured && db) {
    try {
      const ref = collection(db, "pricing");
      const constraints = [
        ...(includeHidden ? [] : [where("isVisible", "==", true)]),
        orderBy("order", "asc"),
      ];
      const q = query(ref, ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (d) => ({ ...d.data(), id: d.id }) as PricingPlan
      );
    } catch {
      // Fall back to seed data on Firebase error
    }
  }

  const pricing = seedData.pricing as unknown as PricingPlan[];
  return sortByOrder(pricing);
}

export async function getFAQs(includeHidden = false): Promise<FAQ[]> {
  if (isFirebaseConfigured && db) {
    try {
      const ref = collection(db, "faqs");
      const constraints = [
        ...(includeHidden ? [] : [where("isVisible", "==", true)]),
        orderBy("order", "asc"),
      ];
      const q = query(ref, ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as FAQ);
    } catch {
      // Fall back to seed data on Firebase error
    }
  }

  const faqs = seedData.faqs as unknown as FAQ[];
  const filtered = includeHidden ? faqs : faqs.filter((f) => f.isVisible);
  return sortByOrder(filtered);
}

export async function getSiteConfig(): Promise<SiteConfig> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "siteConfig", "main");
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as SiteConfig;
      }
    } catch {
      // Fall back to seed data on Firebase error
    }
  }

  return seedData.siteConfig as unknown as SiteConfig;
}

export async function createItem(
  collectionName: string,
  data: Record<string, unknown>
): Promise<string> {
  if (!isFirebaseConfigured || !db) {
    return "";
  }

  const id =
    (data.id as string | undefined) ??
    `${collectionName}_${Date.now()}`;
  const docRef = doc(db, collectionName, id);
  await setDoc(docRef, { ...data, id });
  return id;
}

export async function updateItem(
  collectionName: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    return;
  }

  const docRef = doc(db, collectionName, id);
  await setDoc(docRef, { ...data, id }, { merge: true });
}

export async function deleteItem(
  collectionName: string,
  id: string
): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    return;
  }

  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}

export async function getInquiries(): Promise<Inquiry[]> {
  if (isFirebaseConfigured && db) {
    try {
      const ref = collection(db, "inquiries");
      const q = query(ref, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Inquiry);
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

  if (isFirebaseConfigured && db) {
    const docRef = doc(db, "inquiries", id);
    await setDoc(docRef, inquiry);
    return id;
  }

  return id;
}
