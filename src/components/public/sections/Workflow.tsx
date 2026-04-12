"use client";

import { motion } from "framer-motion";
import { Calendar, Palette, Film, CheckCircle, Rocket } from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import type { TimelineItem } from "@/components/ui/radial-orbital-timeline";
import SectionTitle from "@/components/ui/SectionTitle";
import { useIsMobile } from "@/lib/hooks";
import { getSectionStyle } from "@/lib/section-style";
import { getCardVariants } from "@/lib/animation-config";
import type { SectionBackground, AnimationConfig } from "@/types";

const workflowData: TimelineItem[] = [
  {
    id: 1,
    title: "Discovery",
    date: "Step 1",
    content: "We discuss your vision, brand style, and content goals to create a clear editing brief.",
    category: "Planning",
    icon: Calendar,
    relatedIds: [2],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "Storyboard",
    date: "Step 2",
    content: "We plan the narrative flow, select key moments, and design the visual structure of your video.",
    category: "Design",
    icon: Palette,
    relatedIds: [1, 3],
    status: "completed" as const,
    energy: 85,
  },
  {
    id: 3,
    title: "Edit & Polish",
    date: "Step 3",
    content: "Color grading, transitions, motion graphics, sound design — every frame crafted to perfection.",
    category: "Production",
    icon: Film,
    relatedIds: [2, 4],
    status: "in-progress" as const,
    energy: 65,
  },
  {
    id: 4,
    title: "Review",
    date: "Step 4",
    content: "You review the draft with unlimited revisions until every detail matches your vision.",
    category: "QA",
    icon: CheckCircle,
    relatedIds: [3, 5],
    status: "pending" as const,
    energy: 40,
  },
  {
    id: 5,
    title: "Deliver",
    date: "Step 5",
    content: "Final export optimized for your platform — YouTube, Instagram, TikTok, or all of them.",
    category: "Delivery",
    icon: Rocket,
    relatedIds: [4],
    status: "pending" as const,
    energy: 20,
  },
];

const statusColors: Record<string, string> = {
  completed: "bg-accent-green text-black border-accent-green",
  "in-progress": "bg-white text-black border-white",
  pending: "bg-white/10 text-white border-white/30",
};

interface WorkflowProps {
  readonly background?: SectionBackground;
  readonly animations?: AnimationConfig;
}

function MobileWorkflow({ background, animations }: WorkflowProps) {
  const { item } = getCardVariants(animations);

  return (
    <section id="workflow" className="py-8 px-4" style={getSectionStyle(background)}>
      <div className="text-center mb-6">
        <SectionTitle text="How I Work" highlight="Work" />
        <p className="mx-auto mt-3 max-w-lg text-center text-text-secondary text-sm">
          A streamlined process that turns your raw footage into scroll-stopping content.
        </p>
      </div>

      <div className="max-w-md mx-auto relative px-2">
        {/* Vertical line */}
        <div className="absolute left-[1.625rem] top-0 bottom-0 w-px bg-white/10" />

        <div className="flex flex-col gap-5">
          {workflowData.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                initial={item.hidden}
                whileInView={item.visible}
                viewport={{ once: true }}
                className="flex gap-3 sm:gap-4 items-start"
              >
                {/* Circle icon -- 44px min tap target */}
                <div
                  className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center border-2 z-10 ${statusColors[step.status]}`}
                >
                  <Icon size={18} />
                </div>

                {/* Content */}
                <div className="flex-1 bg-[#111827]/80 border border-white/10 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm sm:text-base font-bold text-white">{step.title}</h3>
                    <span className="text-xs text-white/40 font-mono">{step.date}</span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">{step.content}</p>
                  {/* Energy bar */}
                  <div className="mt-3 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-green to-accent-cyan"
                      style={{ width: `${step.energy}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DesktopWorkflow({ background }: WorkflowProps) {
  return (
    <section id="workflow" className="py-8 md:py-12 lg:py-16 px-4 md:px-6 lg:px-8" style={getSectionStyle(background)}>
      <div className="text-center mb-4">
        <SectionTitle text="How I Work" highlight="Work" />
        <p className="mx-auto mt-4 max-w-lg text-center text-text-secondary">
          A streamlined process that turns your raw footage into scroll-stopping content.
        </p>
      </div>
      <RadialOrbitalTimeline timelineData={workflowData} />
    </section>
  );
}

export default function Workflow({ background, animations }: WorkflowProps) {
  const isMobile = useIsMobile();

  if (isMobile) return <MobileWorkflow background={background} animations={animations} />;
  return <DesktopWorkflow background={background} />;
}
