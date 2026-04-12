"use client";

import { useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import VideoCard from "@/components/ui/VideoCard";
import { formatDuration } from "@/lib/format-duration";
import { getSectionStyle } from "@/lib/section-style";
import { getCardVariants } from "@/lib/animation-config";
import { useIsMobile } from "@/lib/hooks";
import type { Video, SectionBackground, AnimationConfig } from "@/types";

// ---------------------------------------------------------------------------
// YouTube helpers
// ---------------------------------------------------------------------------

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

// ---------------------------------------------------------------------------
// Shared video thumbnail card used across layouts
// ---------------------------------------------------------------------------

interface VideoSlideProps {
  readonly video: Video;
  readonly index: number;
  readonly playingId: string | null;
  readonly onPlay: (id: string) => void;
  readonly onStop: () => void;
}

function VideoSlide({ video, index, playingId, onPlay, onStop }: VideoSlideProps) {
  const ytId = extractYouTubeId(video.videoUrl);
  const isInlinePlaying = playingId === video.id;

  return (
    <div
      className={`relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-bg-card via-bg-card-alt to-bg-card border border-border-glow ${
        isInlinePlaying ? "" : "group cursor-pointer"
      }`}
      onClick={isInlinePlaying ? undefined : () => {
        if (ytId || video.videoUrl) {
          onPlay(video.id);
        }
      }}
    >
      {/* ---- INLINE PLAYER ---- */}
      {isInlinePlaying && ytId ? (
        <>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title={video.title}
          />
          <button
            onClick={(e) => { e.stopPropagation(); onStop(); }}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center transition-colors"
            aria-label="Stop video"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </>
      ) : isInlinePlaying && !ytId ? (
        <>
          <video
            src={video.videoUrl}
            poster={video.thumbnailUrl}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            controls
            playsInline
            title={video.title}
          />
          <button
            onClick={(e) => { e.stopPropagation(); onStop(); }}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center transition-colors"
            aria-label="Stop video"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </>
      ) : (
        <>
          {/* Thumbnail */}
          {video.thumbnailUrl && (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading={index < 3 ? "eager" : "lazy"}
              decoding={index < 3 ? "sync" : "async"}
            />
          )}

          {/* Duration badge */}
          {video.duration && (
            <div className="absolute bottom-12 right-3 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded z-10">
              {formatDuration(video.duration)}
            </div>
          )}

          {/* Play button — min 44x44 for touch targets */}
          <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-red-600 flex items-center justify-center shadow-xl">
              <Play className="w-6 h-6 md:w-7 md:h-7 text-white fill-white ml-0.5" />
            </div>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-white font-medium">{video.title === "Your Video Title" ? "" : video.title}</p>
            {video.viewCount && <p className="text-text-secondary text-sm">{video.viewCount} views</p>}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface RecentEditsProps {
  readonly videos: readonly Video[];
  readonly background?: SectionBackground;
  readonly animations?: AnimationConfig;
  readonly layout?: 'grid' | 'carousel' | 'featured';
}

// ---------------------------------------------------------------------------
// Layout: Grid - multi-column grid
// ---------------------------------------------------------------------------

function GridLayout({ videos, background, animations }: Omit<RecentEditsProps, 'layout'>) {
  const isMobile = useIsMobile(768);
  const { container, item } = getCardVariants(animations, isMobile);
  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <section id="work" className="pt-12 pb-4 md:pt-16 md:pb-6 lg:pt-20 lg:pb-8" style={getSectionStyle(background)}>
      <motion.div
        initial={item.hidden}
        whileInView={item.visible}
        viewport={{ once: true, amount: 0.3 }}
      >
        <SectionTitle text="My Recent Edits" highlight="Edits" />
        <p className="text-text-secondary text-center max-w-2xl mx-auto mt-4 px-4">
          We imagine and build experiences, products and businesses that disrupt the status quo, win hearts and realize the future. Explore how we work.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="mt-12 max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
      >
        {videos.map((video, index) => (
          <motion.div key={video.id} variants={item}>
            <VideoSlide
              video={video}
              index={index}
              playingId={playingId}
              onPlay={setPlayingId}
              onStop={() => setPlayingId(null)}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Layout: Featured - first video large, rest in smaller grid below
// ---------------------------------------------------------------------------

function FeaturedLayout({ videos, background, animations }: Omit<RecentEditsProps, 'layout'>) {
  const isMobile = useIsMobile(768);
  const { container, item } = getCardVariants(animations, isMobile);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const featuredVideo = videos[0];
  const restVideos = videos.slice(1);

  return (
    <section id="work" className="pt-12 pb-4 md:pt-16 md:pb-6 lg:pt-20 lg:pb-8" style={getSectionStyle(background)}>
      <motion.div
        initial={item.hidden}
        whileInView={item.visible}
        viewport={{ once: true, amount: 0.3 }}
      >
        <SectionTitle text="My Recent Edits" highlight="Edits" />
        <p className="text-text-secondary text-center max-w-2xl mx-auto mt-4 px-4">
          We imagine and build experiences, products and businesses that disrupt the status quo, win hearts and realize the future. Explore how we work.
        </p>
      </motion.div>

      <div className="mt-12 max-w-6xl mx-auto px-4">
        {/* Featured (first) video - full width */}
        {featuredVideo && (
          <motion.div
            initial={item.hidden}
            whileInView={item.visible}
            viewport={{ once: true }}
            className="mb-8"
          >
            <VideoSlide
              video={featuredVideo}
              index={0}
              playingId={playingId}
              onPlay={setPlayingId}
              onStop={() => setPlayingId(null)}
            />
          </motion.div>
        )}

        {/* Rest in smaller grid */}
        {restVideos.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {restVideos.map((video, index) => (
              <motion.div key={video.id} variants={item}>
                <VideoSlide
                  video={video}
                  index={index + 1}
                  playingId={playingId}
                  onPlay={setPlayingId}
                  onStop={() => setPlayingId(null)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Layout: Carousel (default) - Embla carousel with autoplay
// ---------------------------------------------------------------------------

function CarouselLayout({ videos, background, animations }: Omit<RecentEditsProps, 'layout'>) {
  const isMobile = useIsMobile(768);
  const { item } = getCardVariants(animations, isMobile);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center" },
    [Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true })]
  );

  const [playingId, setPlayingId] = useState<string | null>(null);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section id="work" className="pt-12 pb-4 md:pt-16 md:pb-6 lg:pt-20 lg:pb-8" style={getSectionStyle(background)}>
      <motion.div
        initial={item.hidden}
        whileInView={item.visible}
        viewport={{ once: true, amount: 0.3 }}
      >
        <SectionTitle text="My Recent Edits" highlight="Edits" />
        <p className="text-text-secondary text-center max-w-2xl mx-auto mt-4 px-4">
          We imagine and build experiences, products and businesses that disrupt the status quo, win hearts and realize the future. Explore how we work.
        </p>
      </motion.div>

      <div className="relative mt-12 max-w-6xl mx-auto px-4">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {videos.map((video, index) => (
              <div key={video.id} className="flex-[0_0_92%] md:flex-[0_0_70%] min-w-0">
                <VideoSlide
                  video={video}
                  index={index}
                  playingId={playingId}
                  onPlay={setPlayingId}
                  onStop={() => setPlayingId(null)}
                />
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
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function RecentEdits({ videos, background, animations, layout = 'carousel' }: RecentEditsProps) {
  if (videos.length === 0) return null;

  if (layout === 'grid') return <GridLayout videos={videos} background={background} animations={animations} />;
  if (layout === 'featured') return <FeaturedLayout videos={videos} background={background} animations={animations} />;
  return <CarouselLayout videos={videos} background={background} animations={animations} />;
}
