"use client"

import { motion } from "framer-motion"
import {
  CardTransformed,
  CardsContainer,
  ContainerScroll,
  ReviewStars,
} from "@/components/ui/animated-cards-stack"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import SectionTitle from "@/components/ui/SectionTitle"
import { useIsMobile } from "@/lib/hooks"
import { getSectionStyle } from "@/lib/section-style"
import { getCardVariants } from "@/lib/animation-config"
import type { Testimonial, SectionBackground, AnimationConfig } from "@/types"

interface TestimonialsProps {
  readonly testimonials: readonly Testimonial[];
  readonly background?: SectionBackground;
  readonly layout?: 'cards' | 'carousel' | 'grid' | 'masonry';
  readonly animations?: AnimationConfig;
}

function TestimonialCard({ testimonial }: { readonly testimonial: Testimonial }) {
  return (
    // backdrop-blur is gated to lg+ — below that we use a solid bg. Much cheaper on mobile GPUs.
    <div className="flex flex-col items-center space-y-4 text-center rounded-2xl border border-white/10 bg-[#111827] lg:bg-[#111827]/90 lg:backdrop-blur-md p-4 md:p-5">
      <ReviewStars className="text-accent-green" rating={testimonial.rating} />
      <div className="text-sm md:text-base text-white/90 leading-relaxed" style={{ fontSize: "max(14px, 0.875rem)" }}>
        <blockquote>&ldquo;{testimonial.quote}&rdquo;</blockquote>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Avatar className="!size-10 border border-white/20">
          {testimonial.clientAvatar ? (
            <AvatarImage
              src={testimonial.clientAvatar}
              alt={`Portrait of ${testimonial.clientName}`}
            />
          ) : null}
          <AvatarFallback className="bg-accent-green/20 text-accent-green font-semibold text-sm">
            {testimonial.clientName ? testimonial.clientName.split(" ").filter(Boolean).map(n => n[0]).join("") : "?"}
          </AvatarFallback>
        </Avatar>
        <div className="text-left">
          <span className="block text-sm font-semibold text-white">
            {testimonial.clientName}
          </span>
          <span className="block text-xs text-white/50">
            {testimonial.clientRole}
          </span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Layout: Grid - simple responsive grid with all testimonials visible
// ---------------------------------------------------------------------------

function GridLayout({ testimonials, background, animations }: Omit<TestimonialsProps, 'layout'>) {
  const { item } = getCardVariants(animations);

  return (
    <section id="testimonials" className="py-8 md:py-12 lg:py-16 px-4 md:px-6 lg:px-8" style={getSectionStyle(background)}>
      <div className="text-center mb-8">
        <SectionTitle text="Client Testimonials" highlight="Testimonials" />
        <p className="mx-auto mt-4 max-w-lg text-center text-text-secondary">
          Hear from creators and brands who transformed their content with our expert video editing.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <motion.div
            key={testimonial.id}
            initial={item.hidden}
            whileInView={item.visible}
            viewport={{ once: true }}
          >
            <TestimonialCard testimonial={testimonial} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Layout: Carousel - horizontal scroll with snap
// ---------------------------------------------------------------------------

function CarouselLayout({ testimonials, background, animations }: Omit<TestimonialsProps, 'layout'>) {
  const { item } = getCardVariants(animations);

  return (
    <section id="testimonials" className="py-8 md:py-12 lg:py-16 px-4 md:px-6 lg:px-8" style={getSectionStyle(background)}>
      <div className="text-center mb-8">
        <SectionTitle text="Client Testimonials" highlight="Testimonials" />
        <p className="mx-auto mt-4 max-w-lg text-center text-text-secondary">
          Hear from creators and brands who transformed their content with our expert video editing.
        </p>
      </div>

      <div className="max-w-7xl mx-auto overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-4 md:gap-6 w-max px-4">
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              initial={item.hidden}
              whileInView={item.visible}
              viewport={{ once: true }}
              className="snap-center w-[calc(100vw-3rem)] max-w-[320px] md:max-w-[380px] md:w-[380px] flex-shrink-0"
            >
              <TestimonialCard testimonial={testimonial} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Layout: Masonry - CSS columns masonry layout
// ---------------------------------------------------------------------------

function MasonryLayout({ testimonials, background, animations }: Omit<TestimonialsProps, 'layout'>) {
  const { item } = getCardVariants(animations);

  return (
    <section id="testimonials" className="py-8 md:py-12 lg:py-16 px-4 md:px-6 lg:px-8" style={getSectionStyle(background)}>
      <div className="text-center mb-8">
        <SectionTitle text="Client Testimonials" highlight="Testimonials" />
        <p className="mx-auto mt-4 max-w-lg text-center text-text-secondary">
          Hear from creators and brands who transformed their content with our expert video editing.
        </p>
      </div>

      <div className="max-w-7xl mx-auto columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {testimonials.map((testimonial) => (
          <motion.div
            key={testimonial.id}
            initial={item.hidden}
            whileInView={item.visible}
            viewport={{ once: true }}
            className="break-inside-avoid"
          >
            <TestimonialCard testimonial={testimonial} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Layout: Cards (default) - original stacking cards / mobile list
// ---------------------------------------------------------------------------

function MobileTestimonials({ testimonials, background, animations }: Omit<TestimonialsProps, 'layout'>) {
  const { item } = getCardVariants(animations);

  return (
    <section id="testimonials" className="py-8 px-4" style={getSectionStyle(background)}>
      <div className="text-center mb-6">
        <SectionTitle text="Client Testimonials" highlight="Testimonials" />
        <p className="mx-auto mt-3 max-w-lg text-center text-text-secondary text-sm">
          Hear from creators and brands who transformed their content with our expert video editing.
        </p>
      </div>

      <div className="flex flex-col gap-4 max-w-md mx-auto">
        {testimonials.map((testimonial) => (
          <motion.div
            key={testimonial.id}
            initial={item.hidden}
            whileInView={item.visible}
            viewport={{ once: true }}
          >
            <TestimonialCard testimonial={testimonial} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function DesktopCardsLayout({ testimonials, background }: Omit<TestimonialsProps, 'layout'>) {
  return (
    <section id="testimonials" className="py-8 md:py-12 lg:py-16 px-4 md:px-6 lg:px-8" style={getSectionStyle(background)}>
      <div className="text-center mb-4">
        <SectionTitle text="Client Testimonials" highlight="Testimonials" />
        <p className="mx-auto mt-4 max-w-lg text-center text-text-secondary">
          Hear from creators and brands who transformed their content with our expert video editing.
        </p>
      </div>

      <ContainerScroll className="max-w-7xl mx-auto h-[250vh]">
        <div className="sticky left-0 top-0 h-screen w-full py-8 flex items-center justify-center">
          <CardsContainer className="mx-auto h-[480px] w-[380px]">
            {testimonials.map((testimonial, index) => (
              <CardTransformed
                arrayLength={testimonials.length}
                key={testimonial.id}
                variant="dark"
                index={index + 2}
                role="article"
              >
                <div className="flex flex-col items-center space-y-4 text-center">
                  <ReviewStars
                    className="text-accent-green"
                    rating={testimonial.rating}
                  />
                  <div className="mx-auto w-4/5 text-lg text-white/90">
                    <blockquote>&ldquo;{testimonial.quote}&rdquo;</blockquote>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Avatar className="!size-12 border border-white/20">
                    {testimonial.clientAvatar ? (
                      <AvatarImage
                        src={testimonial.clientAvatar}
                        alt={`Portrait of ${testimonial.clientName}`}
                      />
                    ) : null}
                    <AvatarFallback className="bg-accent-green/20 text-accent-green font-semibold">
                      {testimonial.clientName ? testimonial.clientName.split(" ").filter(Boolean).map(n => n[0]).join("") : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <span className="block text-lg font-semibold tracking-tight text-white">
                      {testimonial.clientName}
                    </span>
                    <span className="block text-sm text-white/50">
                      {testimonial.clientRole}
                    </span>
                  </div>
                </div>
              </CardTransformed>
            ))}
          </CardsContainer>
        </div>
      </ContainerScroll>
    </section>
  )
}

export default function Testimonials({ testimonials, background, layout = 'cards', animations }: TestimonialsProps) {
  const isMobile = useIsMobile()

  if (testimonials.length === 0) return null

  // Non-default layouts work the same on mobile and desktop
  if (layout === 'grid') return <GridLayout testimonials={testimonials} background={background} animations={animations} />
  if (layout === 'carousel') return <CarouselLayout testimonials={testimonials} background={background} animations={animations} />
  if (layout === 'masonry') return <MasonryLayout testimonials={testimonials} background={background} animations={animations} />

  // Default 'cards' layout preserves the original mobile/desktop split
  if (isMobile) return <MobileTestimonials testimonials={testimonials} background={background} animations={animations} />
  return <DesktopCardsLayout testimonials={testimonials} background={background} />
}
