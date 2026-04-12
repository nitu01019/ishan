"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { getSectionStyle } from "@/lib/section-style";
import type { SectionBackground } from "@/types";

// Only load Spline on desktop (lg+) to save ~500KB on mobile
const SplineScene = dynamic(
  () => import("@/components/ui/splite").then((mod) => mod.SplineScene),
  { ssr: false }
);

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const DEFAULT_WORDS = ["Viral", "Stunning", "Cinematic", "Creative", "Powerful"];

interface HeroProps {
  readonly headline?: string;
  readonly subtitle?: string;
  readonly ctaText?: string;
  readonly socialProofText?: string;
  readonly robotPosition?: 'left' | 'right';
  readonly rotatingWords?: readonly string[];
  readonly secondaryCtaText?: string;
  readonly showSpline?: boolean;
  readonly background?: SectionBackground;
}

export default function Hero({ headline, subtitle, ctaText, socialProofText, robotPosition = 'right', rotatingWords, secondaryCtaText, showSpline, background }: HeroProps) {
  const words = rotatingWords?.length ? rotatingWords : DEFAULT_WORDS;
  const shouldShowSpline = showSpline !== false;
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [wordIndex, words.length]);

  const displayHeadline = headline || "Unleash Your {word} Potential With Pro Video Editing";
  const hasWordPlaceholder = displayHeadline.includes("{word}");
  const headlineParts = hasWordPlaceholder ? displayHeadline.split("{word}") : null;

  const displaySubtitle = subtitle || "We transform raw footage into captivating content that gets seen, shared, and loved. Take your channel to the next level with our expert editing magic.";
  const displayCta = ctaText || "Hire me";
  const displaySocialProof = socialProofText || "Worked with 50+ clients";

  const bgStyle = getSectionStyle(background);

  return (
    <section aria-label="Hero" className="min-h-svh pt-16" style={bgStyle}>
      <Card className="w-full min-h-[calc(100svh-4rem)] bg-black/[0.96] relative overflow-hidden border-0 rounded-none">
        <Spotlight
          className="from-accent-green/20 via-accent-teal/10 to-transparent hidden md:block"
          size={400}
        />

        <div className="absolute inset-0 hero-glow animate-glow-pulse pointer-events-none" />

        <div className={`flex flex-col h-full min-h-[calc(100svh-4rem)] ${robotPosition === 'left' ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
          {/* Left: text content */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="flex-1 relative z-10 flex flex-col justify-center p-5 sm:p-8 md:p-12 lg:p-16"
          >
            <motion.h1
              variants={item}
              className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[64px] font-bold text-white leading-tight"
            >
              {headlineParts ? (
                <>
                  <span>{headlineParts[0]}</span>
                  <span className="relative inline-flex w-[160px] sm:w-[200px] md:w-[280px] lg:w-[340px] xl:w-[400px] justify-start overflow-hidden align-bottom">
                    {words.map((word, i) => (
                      <motion.span
                        key={i}
                        className="absolute text-accent-green font-bold"
                        initial={{ opacity: 0, y: 30 }}
                        animate={
                          wordIndex === i
                            ? { y: 0, opacity: 1 }
                            : { y: wordIndex > i ? -50 : 50, opacity: 0 }
                        }
                        transition={{ type: "spring", stiffness: 80, damping: 15 }}
                      >
                        {word}
                      </motion.span>
                    ))}
                    &nbsp;
                  </span>
                  <br className="hidden xl:block" />
                  <span>{headlineParts[1]}</span>
                </>
              ) : (
                <>
                  <span>Unleash Your </span>
                  <span className="relative inline-flex w-[160px] sm:w-[200px] md:w-[280px] lg:w-[340px] xl:w-[400px] justify-start overflow-hidden align-bottom">
                    {words.map((word, i) => (
                      <motion.span
                        key={i}
                        className="absolute text-accent-green font-bold"
                        initial={{ opacity: 0, y: 30 }}
                        animate={
                          wordIndex === i
                            ? { y: 0, opacity: 1 }
                            : { y: wordIndex > i ? -50 : 50, opacity: 0 }
                        }
                        transition={{ type: "spring", stiffness: 80, damping: 15 }}
                      >
                        {word}
                      </motion.span>
                    ))}
                    &nbsp;
                  </span>
                  <br className="hidden xl:block" />
                  <span>Potential With Pro Video Editing</span>
                </>
              )}
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 text-text-secondary text-base md:text-lg max-w-lg leading-relaxed"
            >
              {displaySubtitle}
            </motion.p>

            <motion.div variants={item} className="mt-8 flex flex-wrap gap-4">
              <LiquidButton variant="green" size="lg" href="#contact">{displayCta}<ArrowRight className="w-4 h-4" /></LiquidButton>
              <LiquidButton variant="outline" size="lg" href="#work">{secondaryCtaText || "See portfolio"}<ArrowRight className="w-4 h-4" /></LiquidButton>
            </motion.div>

            <motion.div variants={item} className="mt-10 flex items-center gap-3">
              <div className="flex -space-x-3">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-bg-primary"
                    style={{ background: `hsl(${150 + i * 30}, 60%, ${35 + i * 5}%)` }}
                  />
                ))}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{displaySocialProof}</p>
                <a href="#testimonials" className="text-accent-green text-sm hover:underline">
                  Read testimonials ›
                </a>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: 3D Spline scene */}
          {shouldShowSpline && (
            <div className="hidden lg:block flex-1 relative">
              <SplineScene
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
              />
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}
