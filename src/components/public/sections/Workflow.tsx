"use client";

import { Calendar, Palette, Film, CheckCircle, Rocket } from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import type { TimelineItem } from "@/components/ui/radial-orbital-timeline";
import SectionTitle from "@/components/ui/SectionTitle";

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

export default function Workflow() {
  return (
    <section id="workflow" className="py-8 md:py-12 lg:py-16 px-4 md:px-6 lg:px-8">
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
