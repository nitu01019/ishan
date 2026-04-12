"use client";

import { useState, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import { getSectionStyle } from "@/lib/section-style";
import { getCardVariants } from "@/lib/animation-config";
import type { SectionBackground, AnimationConfig } from "@/types";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  budget: string;
  message: string;
}

const EMPTY_FORM: ContactFormData = {
  name: "",
  email: "",
  phone: "",
  projectType: "other",
  budget: "",
  message: "",
};

const PROJECT_TYPES = [
  { value: "short-form", label: "Short Form Video" },
  { value: "long-form", label: "Long Form Video" },
  { value: "thumbnail", label: "Thumbnail Design" },
  { value: "seo", label: "SEO Optimization" },
  { value: "consulting", label: "Consulting" },
  { value: "other", label: "Other" },
] as const;

const BUDGET_RANGES = [
  { value: "under-500", label: "Under $500" },
  { value: "500-1000", label: "$500 - $1,000" },
  { value: "1000-2000", label: "$1,000 - $2,000" },
  { value: "2000-5000", label: "$2,000 - $5,000" },
  { value: "5000+", label: "$5,000+" },
] as const;

function ContactForm() {
  const searchParams = useSearchParams();
  const planFromUrl = searchParams.get("plan") ?? "";

  const [form, setForm] = useState<ContactFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: keyof ContactFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          selectedPlan: planFromUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }

      setSuccess(true);
      setForm(EMPTY_FORM);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send message. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClasses =
    "w-full bg-[#1E293B] border border-gray-700 rounded-xl p-3 text-white placeholder:text-gray-500 focus:border-accent-green focus:outline-none transition-colors";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Name */}
      <div>
        <label htmlFor="contact-name" className="block text-gray-400 text-sm mb-1.5">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Your full name"
          className={inputClasses}
          required
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="contact-email" className="block text-gray-400 text-sm mb-1.5">
          Email <span className="text-red-400">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="you@example.com"
          className={inputClasses}
          required
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="contact-phone" className="block text-gray-400 text-sm mb-1.5">Phone</label>
        <input
          id="contact-phone"
          type="tel"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          placeholder="+1 (555) 000-0000"
          className={inputClasses}
        />
      </div>

      {/* Project Type */}
      <div>
        <label htmlFor="contact-project-type" className="block text-gray-400 text-sm mb-1.5">Project Type</label>
        <select
          id="contact-project-type"
          value={form.projectType}
          onChange={(e) => updateField("projectType", e.target.value)}
          className={inputClasses}
        >
          {PROJECT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Budget Range */}
      <div className="md:col-span-2">
        <label htmlFor="contact-budget" className="block text-gray-400 text-sm mb-1.5">Budget Range</label>
        <select
          id="contact-budget"
          value={form.budget}
          onChange={(e) => updateField("budget", e.target.value)}
          className={inputClasses}
        >
          <option value="">Select a budget range</option>
          {BUDGET_RANGES.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div className="md:col-span-2">
        <label htmlFor="contact-message" className="block text-gray-400 text-sm mb-1.5">
          Message <span className="text-red-400">*</span>
        </label>
        <textarea
          id="contact-message"
          value={form.message}
          onChange={(e) => updateField("message", e.target.value)}
          placeholder="Tell me about your project..."
          rows={5}
          className={`${inputClasses} resize-none`}
          required
        />
      </div>

      {/* Hidden plan field */}
      <input type="hidden" name="selectedPlan" value={planFromUrl} />

      {/* Status messages */}
      {success && (
        <div className="md:col-span-2">
          <p className="text-accent-green text-sm font-medium bg-accent-green/10 px-4 py-3 rounded-xl">
            Message sent! I&apos;ll get back to you soon.
          </p>
        </div>
      )}

      {error && (
        <div className="md:col-span-2">
          <p className="text-red-400 text-sm font-medium bg-red-400/10 px-4 py-3 rounded-xl">
            {error}
          </p>
        </div>
      )}

      {/* Submit */}
      <div className="md:col-span-2 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full md:w-auto bg-accent-green text-black font-semibold px-8 py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Sending..." : "Send Message"}
        </button>
      </div>
    </form>
  );
}

interface ContactProps {
  readonly background?: SectionBackground;
  readonly animations?: AnimationConfig;
}

export default function Contact({ background, animations }: ContactProps) {
  const { item } = getCardVariants(animations);

  return (
    <section id="contact" className="py-12 md:py-16 lg:py-20 px-4 md:px-8 lg:px-16" style={getSectionStyle(background)}>
      <SectionTitle text="Let's Work Together" highlight="Together" />
      <p className="text-center text-gray-400 mt-4 max-w-2xl mx-auto text-base md:text-lg">
        Ready to elevate your content? Fill out the form and I&apos;ll get back
        to you within 24 hours.
      </p>

      <motion.div
        initial={item.hidden}
        whileInView={item.visible}
        viewport={{ once: true }}
        className="mt-12 max-w-3xl mx-auto"
      >
        <div className="bg-[#111827] rounded-2xl border border-white/10 p-6 md:p-10">
          <Suspense fallback={<div className="text-gray-400 text-center py-8">Loading form...</div>}>
            <ContactForm />
          </Suspense>
        </div>
      </motion.div>
    </section>
  );
}
