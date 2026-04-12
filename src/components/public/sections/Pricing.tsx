"use client";

import { motion } from "framer-motion";
import { GlassyPricingSection, GlassyPricingCard, type GlassyPricingCardProps } from "@/components/ui/animated-glassy-pricing";
import { getSectionStyle } from "@/lib/section-style";
import { getCardVariants } from "@/lib/animation-config";
import SectionTitle from "@/components/ui/SectionTitle";
import type { PricingPlan, SectionBackground, AnimationConfig } from "@/types";

interface PricingProps {
  readonly plans: readonly PricingPlan[];
  readonly background?: SectionBackground;
  readonly layout?: 'cards' | 'comparison' | 'stacked';
  readonly animations?: AnimationConfig;
}

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="3"
    strokeLinecap="round" strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

function planDescription(planName: string): string {
  if (planName === "Personal") return "Perfect for creators just getting started.";
  if (planName === "Professional") return "For growing channels that need premium edits.";
  return "Full-service solution for established brands.";
}

function toGlassyPlans(plans: readonly PricingPlan[]): GlassyPricingCardProps[] {
  return plans.map((plan) => ({
    planName: plan.planName,
    description: planDescription(plan.planName),
    price: plan.price.toString(),
    features: [...plan.features],
    buttonText: "Get Started",
    isPopular: plan.isHighlighted,
    buttonVariant: plan.isHighlighted ? "primary" as const : "secondary" as const,
    href: "#contact",
  }));
}

// ---------------------------------------------------------------------------
// Layout: Cards (default) - original side-by-side glassy pricing cards
// ---------------------------------------------------------------------------

function CardsLayout({ plans, background }: Omit<PricingProps, 'layout'>) {
  const glassyPlans = toGlassyPlans(plans);

  return (
    <section id="pricing" className="py-12 md:py-16 lg:py-20 max-w-7xl mx-auto px-4 md:px-6 lg:px-8" style={getSectionStyle(background)}>
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

// ---------------------------------------------------------------------------
// Layout: Comparison - table-style comparison (rows = features, cols = plans)
// ---------------------------------------------------------------------------

function ComparisonLayout({ plans, background }: Omit<PricingProps, 'layout'>) {
  // Collect all unique features across all plans
  const allFeatures = Array.from(
    new Set(plans.flatMap((p) => [...p.features]))
  );

  return (
    <section id="pricing" className="py-12 md:py-16 lg:py-20 max-w-7xl mx-auto px-4 md:px-6 lg:px-8" style={getSectionStyle(background)}>
      <div className="text-center mb-12">
        <SectionTitle text="Compare Plans" highlight="Plans" />
        <p className="mx-auto mt-4 max-w-lg text-text-secondary">
          Start scaling your content. Flexible plans for creators of all sizes.
        </p>
      </div>

      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="text-left p-4 text-white/60 text-sm font-medium border-b border-white/10 w-1/4">
                Features
              </th>
              {plans.map((plan) => (
                <th
                  key={plan.id}
                  className={`p-4 text-center border-b border-white/10 ${
                    plan.isHighlighted ? "bg-accent-green/5" : ""
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    {plan.isHighlighted && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-green text-black">
                        Most Popular
                      </span>
                    )}
                    <span className="text-white font-heading text-xl font-bold">
                      {plan.planName}
                    </span>
                    <span className="text-accent-green text-2xl font-heading font-light">
                      ${plan.price}
                      <span className="text-white/50 text-sm font-body">/mo</span>
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allFeatures.map((feature) => (
              <motion.tr
                key={feature}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <td className="p-4 text-white/80 text-sm">{feature}</td>
                {plans.map((plan) => {
                  const hasFeature = plan.features.includes(feature);
                  return (
                    <td
                      key={plan.id}
                      className={`p-4 text-center ${plan.isHighlighted ? "bg-accent-green/5" : ""}`}
                    >
                      {hasFeature ? (
                        <CheckIcon className="text-accent-green w-5 h-5 mx-auto" />
                      ) : (
                        <span className="text-white/20 text-lg">&mdash;</span>
                      )}
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="p-4" />
              {plans.map((plan) => (
                <td key={plan.id} className={`p-4 text-center ${plan.isHighlighted ? "bg-accent-green/5" : ""}`}>
                  <a
                    href="#contact"
                    className={`inline-block px-6 py-2.5 rounded-xl font-semibold text-sm transition ${
                      plan.isHighlighted
                        ? "bg-accent-green text-black hover:brightness-110"
                        : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                    }`}
                  >
                    Get Started
                  </a>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Layout: Stacked - full-width vertical stacked layout
// ---------------------------------------------------------------------------

function StackedLayout({ plans, background, animations }: Omit<PricingProps, 'layout'>) {
  const { item } = getCardVariants(animations);

  return (
    <section id="pricing" className="py-12 md:py-16 lg:py-20 max-w-4xl mx-auto px-4 md:px-6 lg:px-8" style={getSectionStyle(background)}>
      <div className="text-center mb-12">
        <SectionTitle text="Choose Your Plan" highlight="Plan" />
        <p className="mx-auto mt-4 max-w-lg text-text-secondary">
          Start scaling your content. Flexible plans for creators of all sizes.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={item.hidden}
            whileInView={item.visible}
            viewport={{ once: true }}
            className={`relative rounded-2xl border p-6 md:p-8 backdrop-blur-md transition-all ${
              plan.isHighlighted
                ? "border-accent-green/40 bg-accent-green/5 ring-1 ring-accent-green/20"
                : "border-white/10 bg-[#111827]/80"
            }`}
          >
            {plan.isHighlighted && (
              <span className="absolute -top-3 right-6 text-[11px] font-semibold px-3 py-1 rounded-full bg-accent-green text-black">
                Most Popular
              </span>
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Plan info */}
              <div className="flex-1">
                <h3 className="text-2xl font-heading font-bold text-white">{plan.planName}</h3>
                <p className="text-white/60 text-sm mt-1">{planDescription(plan.planName)}</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 md:min-w-[140px] md:justify-center">
                <span className="text-4xl font-heading font-light text-white">${plan.price}</span>
                <span className="text-white/50 text-sm">/mo</span>
              </div>

              {/* CTA */}
              <div className="md:min-w-[140px] md:text-right">
                <a
                  href="#contact"
                  className={`block md:inline-block w-full md:w-auto text-center px-6 py-3 md:py-2.5 rounded-xl font-semibold text-sm transition min-h-[44px] ${
                    plan.isHighlighted
                      ? "bg-accent-green text-black hover:brightness-110"
                      : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                  }`}
                >
                  Get Started
                </a>
              </div>
            </div>

            {/* Features row */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckIcon className="text-accent-green w-4 h-4 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function Pricing({ plans, background, layout = 'cards', animations }: PricingProps) {
  if (plans.length === 0) return null;

  if (layout === 'comparison') return <ComparisonLayout plans={plans} background={background} animations={animations} />;
  if (layout === 'stacked') return <StackedLayout plans={plans} background={background} animations={animations} />;
  return <CardsLayout plans={plans} background={background} animations={animations} />;
}
