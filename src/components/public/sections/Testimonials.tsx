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
import type { Testimonial } from "@/types"

interface TestimonialsProps {
  readonly testimonials: readonly Testimonial[];
}

function TestimonialCard({ testimonial }: { readonly testimonial: Testimonial }) {
  return (
    <div className="flex flex-col items-center space-y-4 text-center rounded-2xl border border-white/10 bg-[#111827]/90 p-5 backdrop-blur-md">
      <ReviewStars className="text-accent-green" rating={testimonial.rating} />
      <div className="text-base text-white/90">
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
            {testimonial.clientName.split(" ").map(n => n[0]).join("")}
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

function MobileTestimonials({ testimonials }: TestimonialsProps) {
  return (
    <section id="testimonials" className="py-8 px-4">
      <div className="text-center mb-6">
        <SectionTitle text="Client Testimonials" highlight="Testimonials" />
        <p className="mx-auto mt-3 max-w-lg text-center text-text-secondary text-sm">
          Hear from creators and brands who transformed their content with our expert video editing.
        </p>
      </div>

      <div className="flex flex-col gap-4 max-w-md mx-auto">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <TestimonialCard testimonial={testimonial} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function DesktopTestimonials({ testimonials }: TestimonialsProps) {
  return (
    <section id="testimonials" className="py-8 md:py-12 lg:py-16 px-4 md:px-6 lg:px-8">
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
                      {testimonial.clientName.split(" ").map(n => n[0]).join("")}
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

export default function Testimonials({ testimonials }: TestimonialsProps) {
  const isMobile = useIsMobile()

  if (isMobile) return <MobileTestimonials testimonials={testimonials} />
  return <DesktopTestimonials testimonials={testimonials} />
}
