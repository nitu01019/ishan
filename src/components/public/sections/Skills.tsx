"use client";

import { motion } from "framer-motion";

interface SkillsProps {
  readonly skills: readonly string[];
}

function MarqueeRow({
  items,
  direction,
}: {
  readonly items: readonly string[];
  readonly direction: "left" | "right";
}) {
  const animationClass =
    direction === "left" ? "animate-scroll-left" : "animate-scroll-right";

  return (
    <div className="marquee-row marquee-mask overflow-hidden">
      <div className={`flex w-max ${animationClass}`}>
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

export default function Skills({ skills }: SkillsProps) {
  const row1 = skills.slice(0, 8);
  const row2 = skills.slice(8);

  return (
    <motion.section
      id="skills"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="py-12 md:py-16 lg:py-20"
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
        <MarqueeRow items={row1} direction="left" />
        <MarqueeRow items={row2} direction="right" />
      </div>
    </motion.section>
  );
}
