"use client";

import { motion } from "framer-motion";
import type { Service } from "@/types";
import {
  ContainerScroll,
  CardsContainer,
  CardTransformed,
} from "@/components/ui/animated-cards-stack";
import Button from "@/components/ui/Button";
import { useIsMobile } from "@/lib/hooks";

interface ServicesProps {
  readonly services: readonly Service[];
}

function MobileServices({ services }: ServicesProps) {
  return (
    <section id="services" className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
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
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
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

function DesktopServices({ services }: ServicesProps) {
  return (
    <section id="services" className="py-8 md:py-12 lg:py-16 px-4 md:px-8 lg:px-16">
      <ContainerScroll className="max-w-7xl mx-auto h-[250vh]">
        <div className="sticky left-0 top-0 h-screen w-full flex flex-row gap-16 py-8">
          {/* Left side - text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
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

export default function Services({ services }: ServicesProps) {
  const isMobile = useIsMobile();

  if (isMobile) return <MobileServices services={services} />;
  return <DesktopServices services={services} />;
}
