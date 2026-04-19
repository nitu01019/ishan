"use client";

import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

interface NavbarProps {
  readonly logoText?: string;
  readonly ctaText?: string;
  readonly style?: 'glass' | 'solid' | 'minimal';
  readonly sticky?: boolean;
  readonly opacity?: number;
  readonly bgColor?: string;
}

export default function Navbar({
  logoText,
  ctaText,
  style = 'glass',
  sticky = true,
  opacity = 80,
  bgColor = '#0B1120',
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const positionClass = sticky ? "fixed top-0" : "absolute top-0";

  const opacityFraction = Math.min(Math.max(opacity, 0), 100) / 100;

  function getScrolledClasses(): string {
    switch (style) {
      case 'solid':
        return "border-b border-white/10";
      case 'minimal':
        return "";
      case 'glass':
      default:
        // Backdrop-blur is a GPU-killer on mobile — only enable it on lg+
        // viewports; below that fall back to a solid-ish background.
        return "lg:backdrop-blur-xl border-b border-white/10";
    }
  }

  function getScrolledStyle(): React.CSSProperties | undefined {
    if (!scrolled) return undefined;

    switch (style) {
      case 'solid':
        return {
          backgroundColor: bgColor,
          opacity: opacityFraction,
          boxShadow: "0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
        };
      case 'minimal':
        return undefined;
      case 'glass':
      default:
        return {
          // Opaque-ish fallback for mobile; on lg+ the blur takes over.
          backgroundColor: `rgba(11, 17, 32, ${0.88 * opacityFraction})`,
          boxShadow: "0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
        };
    }
  }

  return (
    <nav
      aria-label="Main navigation"
      className={`${positionClass} left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? getScrolledClasses() : "bg-transparent"
      }`}
      style={getScrolledStyle()}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="font-heading italic text-2xl text-accent-green" aria-label={`${logoText || "Ishan"} - Home`}>
          {logoText || "Ishan"}
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="nav-link-underline text-[15px] font-medium text-white/80 hover:text-white transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/admin"
            className="text-text-muted/30 hover:text-text-muted text-xs transition-colors"
            aria-label="Admin panel"
          >
            &bull;
          </a>
        </div>

        {/* Desktop CTA — glass pill button */}
        <div className="hidden md:block">
          <a
            href="#contact"
            className="relative inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-semibold text-black overflow-hidden transition-all duration-300 hover:scale-105"
            style={{
              boxShadow: "0 0 15px rgba(0,230,118,0.2), inset 0 1px 1px rgba(255,255,255,0.3)",
            }}
          >
            <div className="absolute inset-0 rounded-full bg-[#00E676]" />
            <div className="absolute top-0 left-[10%] right-[10%] h-[50%] rounded-full bg-gradient-to-b from-white/40 to-transparent opacity-30" />
            <span className="relative z-10 flex items-center gap-2">
              {ctaText || "Hire me"} <ArrowRight className="w-4 h-4" />
            </span>
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer — solid bg (no backdrop-blur: too expensive on mobile GPU). */}
      <div
        className={`md:hidden bg-[#0B1120] border-t border-white/10 transition-all duration-300 ${
          mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="px-4 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              tabIndex={mobileOpen ? 0 : -1}
              className="text-base font-medium text-white/80 hover:text-white py-2 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMobileOpen(false)}
            tabIndex={mobileOpen ? 0 : -1}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-black bg-[#00E676] hover:brightness-110 transition-all"
          >
            {ctaText || "Hire me"} <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </nav>
  );
}
