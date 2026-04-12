"use client";

import { motion } from "framer-motion";
import type { Service, SectionBackground, AnimationConfig } from "@/types";
import { getSectionStyle } from "@/lib/section-style";
import { getCardVariants } from "@/lib/animation-config";
import {
  ContainerScroll,
  CardsContainer,
  CardTransformed,
} from "@/components/ui/animated-cards-stack";
import Button from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";
import { useIsMobile } from "@/lib/hooks";

interface ServicesProps {
  readonly services: readonly Service[];
  readonly background?: SectionBackground;
  readonly layout?: 'cards' | 'timeline' | 'icons-grid';
  readonly animations?: AnimationConfig;
}

// ---------------------------------------------------------------------------
// Layout: Timeline - vertical timeline with alternating left/right items
// ---------------------------------------------------------------------------

function TimelineLayout({ services, background, animations }: Omit<ServicesProps, 'layout'>) {
  const { item } = getCardVariants(animations);
  return (
    <section id="services" className="py-8 md:py-12 lg:py-16 px-4 md:px-6 lg:px-8" style={getSectionStyle(background)}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <SectionTitle text="What I can do for You" highlight="for You" />
          <p className="mt-4 text-text-secondary max-w-md mx-auto">
            We imagine and build experiences, products and businesses that
            disrupt the status quo, win hearts and realize the future.
          </p>
          <div className="mt-6">
            <Button href="#contact" variant="primary">
              Book a Call Now
            </Button>
          </div>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-accent-green/30 -translate-x-1/2 hidden md:block" />
          <div className="absolute left-4 top-0 bottom-0 w-px bg-accent-green/30 md:hidden" />

          {services.map((service, index) => {
            const isLeft = index % 2 === 0;
            return (
              <motion.div
                key={service.id}
                initial={item.hidden}
                whileInView={item.visible}
                viewport={{ once: true }}
                className="relative mb-10 last:mb-0"
              >
                {/* Dot on the timeline */}
                <div className="absolute left-4 md:left-1/2 top-6 w-3 h-3 rounded-full bg-accent-green border-2 border-bg-primary -translate-x-1/2 z-10" />

                {/* Card - mobile always right, desktop alternates */}
                <div className={`pl-12 md:pl-0 md:w-[45%] ${isLeft ? "md:mr-auto md:pr-8 md:text-right" : "md:ml-auto md:pl-8 md:text-left"}`}>
                  <div className="rounded-2xl bg-gradient-to-br from-accent-green via-accent-teal to-accent-cyan p-5">
                    <h3 className="text-xl font-bold text-black">{service.title}</h3>
                    <p className="text-black/80 text-sm leading-relaxed mt-2">
                      {service.description}
                    </p>
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

// ---------------------------------------------------------------------------
// Layout: Icons Grid - compact grid with large icons and short descriptions
// ---------------------------------------------------------------------------

const SERVICE_ICONS: readonly string[] = [
  // Film/Video icon
  "M15.91 3.417A2 2 0 0 0 14.09 2H9.91a2 2 0 0 0-1.82 1.417L7.5 6h9l-.59-2.583z",
  // Scissors
  "M12 2L2 22h20L12 2z",
  // Magic wand
  "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
];

function IconsGridLayout({ services, background, animations }: Omit<ServicesProps, 'layout'>) {
  const { item } = getCardVariants(animations);
  return (
    <section id="services" className="py-8 md:py-12 lg:py-16 px-4 md:px-6 lg:px-8" style={getSectionStyle(background)}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <SectionTitle text="What I can do for You" highlight="for You" />
          <p className="mt-4 text-text-secondary max-w-md mx-auto">
            We imagine and build experiences, products and businesses that
            disrupt the status quo, win hearts and realize the future.
          </p>
          <div className="mt-6">
            <Button href="#contact" variant="primary">
              Book a Call Now
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={item.hidden}
              whileInView={item.visible}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center rounded-2xl border border-white/10 bg-[#111827]/80 backdrop-blur-md p-6 hover:border-accent-green/30 transition-colors"
            >
              {/* Icon circle */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-green via-accent-teal to-accent-cyan flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28" height="28" viewBox="0 0 24 24"
                  fill="none" stroke="black" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d={SERVICE_ICONS[index % SERVICE_ICONS.length]} />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Layout: Cards (default) - original stacking cards with mobile/desktop split
// ---------------------------------------------------------------------------

function MobileServices({ services, background, animations }: Omit<ServicesProps, 'layout'>) {
  const { item } = getCardVariants(animations);

  return (
    <section id="services" className="py-8 px-4" style={getSectionStyle(background)}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={item.hidden}
          whileInView={item.visible}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-2xl sm:text-3xl font-bold">
            What I can do <span className="text-accent-green">for You</span>
          </h2>
          <p className="mt-4 text-text-secondary text-sm sm:text-base leading-relaxed max-w-md">
            We imagine and build experiences, products and businesses that
            disrupt the status quo, win hearts and realize the future.
          </p>
          <div className="mt-6">
            <Button href="#contact" variant="primary">
              Book a Call Now
            </Button>
          </div>
        </motion.div>

        <div className="mt-8 flex flex-col gap-4">
          {services.map((service) => (
            <motion.div
              key={service.id}
              initial={item.hidden}
              whileInView={item.visible}
              viewport={{ once: true }}
              className="rounded-2xl bg-gradient-to-br from-accent-green via-accent-teal to-accent-cyan p-5"
            >
              <h3 className="text-xl font-bold text-black">{service.title}</h3>
              <p className="text-black/80 text-sm leading-relaxed mt-2">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DesktopCardsLayout({ services, background, animations }: Omit<ServicesProps, 'layout'>) {
  const { item } = getCardVariants(animations);

  return (
    <section id="services" className="py-8 md:py-12 lg:py-16 px-4 md:px-8 lg:px-16" style={getSectionStyle(background)}>
      <ContainerScroll className="max-w-7xl mx-auto h-[250vh]">
        <div className="sticky left-0 top-0 h-screen w-full flex flex-row gap-16 py-8">
          {/* Left side - text content */}
          <motion.div
            initial={item.hidden}
            whileInView={item.visible}
            viewport={{ once: true }}
            className="w-[40%] flex flex-col justify-center"
          >
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-left">
              What I can do{" "}
              <span className="text-accent-green">for You</span>
            </h2>
            <p className="mt-6 text-text-secondary text-base md:text-lg leading-relaxed max-w-md">
              We imagine and build experiences, products and businesses that
              disrupt the status quo, win hearts and realize the future. Explore
              how we work.
            </p>
            <div className="mt-8">
              <Button href="#contact" variant="primary">
                Book a Call Now
              </Button>
            </div>
          </motion.div>

          {/* Right side - stacking cards */}
          <div className="w-[60%] flex items-center justify-center">
            <CardsContainer className="mx-auto h-[350px] w-full max-w-[500px]">
              {services.map((service, index) => (
                <CardTransformed
                  key={service.id}
                  arrayLength={services.length}
                  index={index + 2}
                  className="!bg-gradient-to-br !from-accent-green !via-accent-teal !to-accent-cyan !border-none !backdrop-blur-none"
                >
                  <div className="flex flex-col items-start justify-center gap-4 text-left w-full">
                    <h3 className="text-2xl md:text-3xl font-bold text-black">
                      {service.title}
                    </h3>
                    <p className="text-black/80 text-base leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </CardTransformed>
              ))}
            </CardsContainer>
          </div>
        </div>
      </ContainerScroll>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function Services({ services, background, layout = 'cards', animations }: ServicesProps) {
  const isMobile = useIsMobile();

  if (services.length === 0) return null;

  // Non-default layouts work the same on mobile and desktop
  if (layout === 'timeline') return <TimelineLayout services={services} background={background} animations={animations} />;
  if (layout === 'icons-grid') return <IconsGridLayout services={services} background={background} animations={animations} />;

  // Default 'cards' layout preserves the original mobile/desktop split
  if (isMobile) return <MobileServices services={services} background={background} animations={animations} />;
  return <DesktopCardsLayout services={services} background={background} animations={animations} />;
}
