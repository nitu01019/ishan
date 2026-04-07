"use client"

import {
  CardTransformed,
  CardsContainer,
  ContainerScroll,
  ReviewStars,
} from "@/components/ui/animated-cards-stack"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import SectionTitle from "@/components/ui/SectionTitle"
import type { Testimonial } from "@/types"

interface TestimonialsProps {
  readonly testimonials: readonly Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
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
          <CardsContainer className="mx-auto h-[450px] w-[350px] md:h-[480px] md:w-[380px]">
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
