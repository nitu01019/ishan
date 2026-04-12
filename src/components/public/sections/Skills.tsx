"use client";

import { motion } from "framer-motion";
import { getSectionStyle } from "@/lib/section-style";
import { getCardVariants, getScrollSpeed } from "@/lib/animation-config";
import { useIsMobile } from "@/lib/hooks";
import type { SectionBackground, AnimationConfig } from "@/types";

interface SkillsProps {
  readonly skills: readonly string[];
  readonly background?: SectionBackground;
  readonly animations?: AnimationConfig;
}

function MarqueeRow({
  items,
  direction,
  scrollSpeed,
}: {
  readonly items: readonly string[];
  readonly direction: "left" | "right";
  readonly scrollSpeed?: number;
}) {
  const animationClass =
    direction === "left" ? "animate-scroll-left" : "animate-scroll-right";

  const durationStyle = scrollSpeed
    ? ({ "--scroll-duration": `${scrollSpeed}s` } as React.CSSProperties)
    : undefined;

  return (
    <div className="marquee-row marquee-mask overflow-hidden">
      <div className={`flex w-max ${animationClass}`} style={durationStyle}>
        {/* Render twice for seamless loop */}
        {[...items, ...items].map((skill, index) => (
          <span
            key={`${skill}-${index}`}
            className="font-body font-medium text-base md:text-xl text-white/80 whitespace-nowrap px-4 md:px-6"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

function StaticGrid({ items }: { readonly items: readonly string[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 px-4">
      {items.map((skill, index) => (
        <span
          key={`${skill}-${index}`}
          className="font-body font-medium text-sm md:text-base text-white/80 text-center py-3 px-3 rounded-xl border border-white/10 bg-white/5"
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

function StaticRow({ items }: { readonly items: readonly string[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {items.map((skill, index) => (
        <span
          key={`${skill}-${index}`}
          className="font-body font-medium text-xl text-white/80 whitespace-nowrap px-6"
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

export default function Skills({ skills, background, animations }: SkillsProps) {
  if (skills.length === 0) return null;

  const isMobile = useIsMobile();
  const { item } = getCardVariants(animations);
  const scrollSpeed = getScrollSpeed(animations);
  const scrollEnabled = animations?.scrollAnimations !== false;

  // On mobile, cap items per marquee row to reduce paint cost
  const mobileRowLimit = 6;
  const row1 = isMobile ? skills.slice(0, mobileRowLimit) : skills.slice(0, 8);
  const row2 = isMobile ? skills.slice(mobileRowLimit, mobileRowLimit * 2) : skills.slice(8);

  // On mobile with scroll animations off, show a simple grid instead of rows
  if (isMobile && !scrollEnabled) {
    return (
      <motion.section
        id="skills"
        initial={item.hidden}
        whileInView={item.visible}
        viewport={{ once: true, margin: "-50px" }}
        className="py-8 md:py-16 lg:py-20"
        style={getSectionStyle(background)}
      >
        <h2 className="font-heading text-2xl sm:text-3xl md:text-5xl font-bold text-white text-center">
          Skills
        </h2>
        <p className="mt-4 mx-auto max-w-2xl text-center text-text-secondary text-sm md:text-lg leading-relaxed px-4">
          Each skill is a brushstroke contributing to the masterpiece of your
          online presence. Let us weave innovation, aesthetics, and leadership
          into the fabric of your digital journey.
        </p>
        <div className="mt-8">
          <StaticGrid items={skills} />
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      id="skills"
      initial={item.hidden}
      whileInView={item.visible}
      viewport={{ once: true, margin: "-100px" }}
      className="py-8 md:py-16 lg:py-20"
      style={getSectionStyle(background)}
    >
      <h2 className="font-heading text-2xl sm:text-3xl md:text-5xl font-bold text-white text-center">
        Skills
      </h2>
      <p className="mt-4 md:mt-6 mx-auto max-w-2xl text-center text-text-secondary text-sm md:text-lg leading-relaxed px-4">
        Each skill is a brushstroke contributing to the masterpiece of your
        online presence. Let us weave innovation, aesthetics, and leadership
        into the fabric of your digital journey.
      </p>

      <div className="mt-8 md:mt-12 flex flex-col gap-6 md:gap-8">
        {scrollEnabled ? (
          <>
            <MarqueeRow items={row1} direction="left" scrollSpeed={scrollSpeed} />
            {row2.length > 0 && <MarqueeRow items={row2} direction="right" scrollSpeed={scrollSpeed} />}
          </>
        ) : (
          <>
            <StaticRow items={row1} />
            {row2.length > 0 && <StaticRow items={row2} />}
          </>
        )}
      </div>
    </motion.section>
  );
}
