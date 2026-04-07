"use client";

import { GlassyPricingSection, type GlassyPricingCardProps } from "@/components/ui/animated-glassy-pricing";
import type { PricingPlan } from "@/types";

interface PricingProps {
  readonly plans: readonly PricingPlan[];
}

export default function Pricing({ plans }: PricingProps) {
  // Convert our PricingPlan data to GlassyPricingCardProps format
  const glassyPlans: GlassyPricingCardProps[] = plans.map((plan) => ({
    planName: plan.planName,
    description: plan.planName === "Personal"
      ? "Perfect for creators just getting started."
      : plan.planName === "Professional"
      ? "For growing channels that need premium edits."
      : "Full-service solution for established brands.",
    price: plan.price.toString(),
    features: [...plan.features],
    buttonText: "Get Started",
    isPopular: plan.isHighlighted,
    buttonVariant: plan.isHighlighted ? "primary" as const : "secondary" as const,
    href: "#contact",
  }));

  return (
    <section id="pricing" className="py-12 md:py-16 lg:py-20 max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
      <GlassyPricingSection
        title={
          <>
            Find the <span className="text-[#00E676]">Perfect Plan</span> for Your Growth
          </>
        }
        subtitle="Start scaling your content. Flexible plans for creators of all sizes."
        plans={glassyPlans}
        showAnimatedBackground={true}
      />
    </section>
  );
}
