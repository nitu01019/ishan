"use client";

import { useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import VideoLightbox from "@/components/ui/VideoLightbox";
import type { Video } from "@/types";

interface RecentEditsProps {
  readonly videos: readonly Video[];
}

export default function RecentEdits({ videos }: RecentEditsProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center" },
    [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section id="work" className="pt-12 pb-4 md:pt-16 md:pb-6 lg:pt-20 lg:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
      >
        <SectionTitle text="My Recent Edits" highlight="Edits" />
        <p className="text-text-secondary text-center max-w-2xl mx-auto mt-4 px-4">
          We imagine and build experiences, products and businesses that disrupt the status quo, win hearts and realize the future. Explore how we work.
        </p>
      </motion.div>

      <div className="relative mt-12 max-w-6xl mx-auto px-4">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {videos.map((video) => (
              <div key={video.id} className="flex-[0_0_85%] md:flex-[0_0_70%] min-w-0">
                <div onClick={() => setActiveVideo(video)} className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-bg-card via-bg-card-alt to-bg-card border border-border-glow group cursor-pointer">
                  {video.thumbnailUrl && (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  {/* Duration badge */}
                  {video.duration && (
                    <div className="absolute bottom-12 right-3 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded z-10">
                      {video.duration}
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-xl">
                      <Play className="w-7 h-7 text-white fill-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-white font-medium">{video.title === "Your Video Title" ? "" : video.title}</p>
                    {video.viewCount && <p className="text-text-secondary text-sm">{video.viewCount} views</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={scrollPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-gray-600 bg-bg-primary/80 flex items-center justify-center text-white hover:border-accent-green transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-gray-600 bg-bg-primary/80 flex items-center justify-center text-white hover:border-accent-green transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <VideoLightbox
        isOpen={activeVideo !== null}
        onClose={() => setActiveVideo(null)}
        videoUrl={activeVideo?.videoUrl ?? ""}
        posterUrl={activeVideo?.thumbnailUrl}
      />
    </section>
  );
}
