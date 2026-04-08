"use client";

import { Linkedin, Instagram, Twitter } from "lucide-react";

const QUICK_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
] as const;

const SERVICE_LINKS = [
  { label: "Short Form Video", href: "#services" },
  { label: "Thumbnail Design", href: "#services" },
  { label: "SEO Optimization", href: "#services" },
  { label: "Consulting", href: "#services" },
] as const;

interface FooterProps {
  readonly name?: string;
  readonly tagline?: string;
  readonly socials?: {
    readonly linkedin?: string;
    readonly instagram?: string;
    readonly twitter?: string;
  };
}

export default function Footer({ name, tagline, socials }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const displayName = name || "Ishan";
  const displayTagline = tagline || "Bringing stories to life with cinematic precision and creative flair.";

  const socialLinks = [
    { icon: Linkedin, href: socials?.linkedin || "#", label: "LinkedIn" },
    { icon: Instagram, href: socials?.instagram || "#", label: "Instagram" },
    { icon: Twitter, href: socials?.twitter || "#", label: "Twitter (X)" },
  ];

  return (
    <footer role="contentinfo" className="border-t border-gray-800 pb-safe">
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
        {/* Multi-column layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3
              className="font-heading text-2xl font-bold text-white"
              itemScope
              itemType="https://schema.org/Person"
            >
              <span itemProp="name">{displayName}</span>
            </h3>
            <p className="text-text-secondary text-sm mt-2">
              {displayTagline}
            </p>
            <p className="font-semibold text-white mt-4">
              Let&apos;s connect!
            </p>
            <div className="flex gap-3 mt-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={`Follow on ${label}`}
                  rel={href !== "#" ? "noopener noreferrer" : undefined}
                  target={href !== "#" ? "_blank" : undefined}
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-accent-green hover:text-black transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links column */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <nav aria-label="Quick links" className="flex flex-col gap-2">
              {QUICK_LINKS.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  className="text-text-secondary text-sm hover:text-white transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

          {/* Services column */}
          <div>
            <h4 className="font-semibold text-white mb-4">Services</h4>
            <nav aria-label="Services" className="flex flex-col gap-2">
              {SERVICE_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="text-text-secondary text-sm hover:text-white transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact column */}
          <div>
            <h4 className="font-semibold text-white mb-4">Get in Touch</h4>
            <address className="not-italic flex flex-col gap-2">
              <a
                href="#contact"
                className="text-text-secondary text-sm hover:text-white transition-colors"
              >
                Send a Message
              </a>
              <p className="text-text-secondary text-sm">
                Available for freelance projects
              </p>
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 mt-8 border-t border-gray-800">
          <p className="text-text-muted text-sm">
            &copy; {currentYear} {displayName}. All rights reserved.
          </p>
          <p className="text-text-muted text-sm">
            Designed and Developed By{" "}
            <span className="text-accent-green">{displayName}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
