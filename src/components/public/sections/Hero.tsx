"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { getSectionStyle } from "@/lib/section-style";
import type { SectionBackground } from "@/types";

const SPLINE_SCENE_URL = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

function SplineLoadingPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        {/* Head */}
        <div className="w-20 h-20 rounded-full bg-white/5" />
        {/* Shoulders */}
        <div className="w-44 h-5 rounded-full bg-white/5 -mb-1" />
        {/* Torso */}
        <div className="w-36 h-32 rounded-2xl bg-white/5" />
        {/* Arms alongside torso */}
        <div className="flex w-56 justify-between -mt-28">
          <div className="w-8 h-24 rounded-xl bg-white/5" />
          <div className="w-8 h-24 rounded-xl bg-white/5" />
        </div>
        {/* Legs */}
        <div className="flex gap-5 mt-4">
          <div className="w-11 h-28 rounded-xl bg-white/5" />
          <div className="w-11 h-28 rounded-xl bg-white/5" />
        </div>
      </div>
    </div>
  );
}

// Use next/dynamic with ssr:false so the import starts immediately on hydration,
// not after a useEffect sets isDesktop=true (eliminates ~2s delay).
const SplineScene = dynamic(
  () => import("@/components/ui/splite").then((mod) => ({ default: mod.SplineScene })),
  { ssr: false, loading: () => <SplineLoadingPlaceholder /> }
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
  const [shouldLoadSpline, setShouldLoadSpline] = useState(false);
  const wordIndexRef = useRef(0);
  const wordsLengthRef = useRef(words.length);
  wordsLengthRef.current = words.length;
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (wordIndexRef.current + 1) % wordsLengthRef.current;
      wordIndexRef.current = next;
      setWordIndex(next);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Defer Spline loading until the browser is idle so it doesn't compete with
  // critical hero content for bandwidth / main-thread time. Falls back to a
  // 800ms setTimeout for browsers without requestIdleCallback (Safari).
  useEffect(() => {
    if (!shouldShowSpline) return;

    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const w = window as IdleWindow;

    let idleHandle: number | null = null;
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

    const trigger = () => setShouldLoadSpline(true);

    if (typeof w.requestIdleCallback === "function") {
      idleHandle = w.requestIdleCallback(trigger, { timeout: 2000 });
      // Safety fallback in case idle callback is delayed too long.
      timeoutHandle = setTimeout(trigger, 800);
    } else {
      timeoutHandle = setTimeout(trigger, 800);
    }

    return () => {
      if (idleHandle !== null && typeof w.cancelIdleCallback === "function") {
        w.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== null) {
        clearTimeout(timeoutHandle);
      }
    };
  }, [shouldShowSpline]);

  // Forward pointermove events from the whole hero section to the Spline canvas
  // so the robot tracks the cursor even while hovering over text / overlays
  // that sit above the absolute full-width canvas.
  useEffect(() => {
    if (!shouldLoadSpline) return;
    const section = heroRef.current;
    if (!section) return;
    let canvas: HTMLCanvasElement | null = null;
    let disposed = false;

    const tryAttach = () => {
      if (disposed) return;
      const c = section.querySelector('canvas');
      if (c) {
        canvas = c;
        return;
      }
      requestAnimationFrame(tryAttach);
    };
    tryAttach();

    const forward = (e: PointerEvent) => {
      if (!canvas || e.target === canvas) return;
      canvas.dispatchEvent(new PointerEvent('pointermove', {
        clientX: e.clientX,
        clientY: e.clientY,
        bubbles: false,
        cancelable: true,
        pointerType: 'mouse',
      }));
    };

    section.addEventListener('pointermove', forward, { passive: true });
    return () => {
      disposed = true;
      section.removeEventListener('pointermove', forward);
    };
  }, [shouldLoadSpline]);

  const displayHeadline = headline || "Unleash Your {word} Potential With Pro Video Editing";
  const hasWordPlaceholder = displayHeadline.includes("{word}");
  const headlineParts = hasWordPlaceholder ? displayHeadline.split("{word}") : null;

  const displaySubtitle = subtitle || "We transform raw footage into captivating content that gets seen, shared, and loved. Take your channel to the next level with our expert editing magic.";
  const displayCta = ctaText || "Hire me";
  const displaySocialProof = socialProofText || "Worked with 50+ clients";

  const bgStyle = getSectionStyle(background);

  return (
    <section ref={heroRef} aria-label="Hero" className="min-h-svh pt-16" style={bgStyle}>
      <Card className="w-full min-h-[calc(100svh-4rem)] bg-black/[0.96] relative overflow-hidden border-0 rounded-none">
        <Spotlight
          className="from-accent-green/20 via-accent-teal/10 to-transparent hidden md:block"
          size={400}
        />

        <div className="absolute inset-0 hero-glow animate-glow-pulse pointer-events-none" />

        {/* Spline canvas as full-width absolute overlay (desktop only).
            Padded on the right so the robot doesn't touch the far edge. */}
        {shouldShowSpline && (
          <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none lg:pr-[3vw]">
            {shouldLoadSpline ? (
              <SplineScene scene={SPLINE_SCENE_URL} className="w-full h-full" />
            ) : (
              <SplineLoadingPlaceholder />
            )}
          </div>
        )}

        {/* Legibility gradient: darkens the left half so text stays readable
            when the robot canvas sits behind it. Assumes robot-right (default);
            if robotPosition === 'left' the gradient would need to be mirrored. */}
        <div
          aria-hidden
          className="hidden lg:block absolute inset-0 z-[5] pointer-events-none bg-[linear-gradient(to_right,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.6)_40%,rgba(0,0,0,0)_60%)]"
        />

        <div className={`flex flex-col h-full min-h-[calc(100svh-4rem)] ${robotPosition === 'left' ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
          {/* Left: text content */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="flex-1 relative z-10 flex flex-col justify-center p-5 sm:p-8 md:p-12 lg:p-16 lg:max-w-[55%]"
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

            <motion.div variants={item} className="mt-8 flex flex-col min-[380px]:flex-row flex-wrap gap-4">
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

          {/* Right column intentionally empty on desktop — the 3D Spline scene
              is now rendered as a full-width absolute overlay above the Card. */}
        </div>
      </Card>
    </section>
  );
}
