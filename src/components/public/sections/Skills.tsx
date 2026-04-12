"use client";

import { motion } from "framer-motion";
import { getSectionStyle } from "@/lib/section-style";
import { getCardVariants, getScrollSpeed } from "@/lib/animation-config";
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
            className="font-body font-medium text-xl text-white/80 whitespace-nowrap px-6"
          >
            {skill}
          </span>
        ))}
      </div>
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

  const { item } = getCardVariants(animations);
  const scrollSpeed = getScrollSpeed(animations);
  const scrollEnabled = animations?.scrollAnimations !== false;

  const row1 = skills.slice(0, 8);
  const row2 = skills.slice(8);

  return (
    <motion.section
      id="skills"
      initial={item.hidden}
      whileInView={item.visible}
      viewport={{ once: true, margin: "-100px" }}
      className="py-12 md:py-16 lg:py-20"
      style={getSectionStyle(background)}
    >
      <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center">
        Skills
      </h2>
      <p className="mt-6 mx-auto max-w-2xl text-center text-text-secondary text-base md:text-lg leading-relaxed px-4">
        Each skill is a brushstroke contributing to the masterpiece of your
        online presence. Let us weave innovation, aesthetics, and leadership
        into the fabric of your digital journey.
      </p>

      <div className="mt-12 flex flex-col gap-8">
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
