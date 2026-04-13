"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";
import VideoCard from "@/components/ui/VideoCard";
import { getSectionStyle } from "@/lib/section-style";
import { getCardVariants } from "@/lib/animation-config";
import { useIsMobile } from "@/lib/hooks";
import type { Video, SectionBackground, AnimationConfig } from "@/types";

interface ShortVideosProps {
  readonly videos: readonly Video[];
  readonly background?: SectionBackground;
  readonly animations?: AnimationConfig;
  readonly layout?: 'grid' | 'carousel' | 'featured';
}

const INITIAL_COUNT = 4;

// ---------------------------------------------------------------------------
// Layout: Grid - multi-column grid
// ---------------------------------------------------------------------------

function GridLayout({ videos, background, animations }: Omit<ShortVideosProps, 'layout'>) {
  const isMobile = useIsMobile(768);
  const { container, item } = getCardVariants(animations, isMobile);
  const [showAll, setShowAll] = useState(false);
  const visibleVideos = showAll ? videos : videos.slice(0, INITIAL_COUNT);
  const hasMore = videos.length > INITIAL_COUNT;

  return (
    <section className="py-4 md:py-6 lg:py-8" style={getSectionStyle(background)}>
      <SectionTitle text="Short Videos" highlight="Videos" />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
        className="mt-12 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 px-4 md:px-0 max-w-7xl mx-auto"
      >
        {visibleVideos.map((video, i) => (
          <motion.div key={video.id} variants={item}>
            <VideoCard video={video} variant="portrait" showSound={i === 1} />
          </motion.div>
        ))}
      </motion.div>

      {hasMore && (
        <div className="flex justify-center mt-8 px-4 md:px-0">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 min-h-[44px] rounded-xl border border-border-glow text-white hover:border-accent-green hover:text-accent-green transition-colors text-sm font-medium"
          >
            {showAll ? (
              <>Show Less <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>View All ({videos.length}) <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Layout: Featured - first video large, rest in smaller grid below
// ---------------------------------------------------------------------------

function FeaturedLayout({ videos, background, animations }: Omit<ShortVideosProps, 'layout'>) {
  const isMobile = useIsMobile(768);
  const { container, item } = getCardVariants(animations, isMobile);
  const [showAll, setShowAll] = useState(false);
  const featuredVideo = videos[0];
  const restVideos = showAll ? videos.slice(1) : videos.slice(1, INITIAL_COUNT);
  const hasMore = videos.length > INITIAL_COUNT;

  return (
    <section className="py-4 md:py-6 lg:py-8" style={getSectionStyle(background)}>
      <SectionTitle text="Short Videos" highlight="Videos" />

      <div className="mt-12 max-w-7xl mx-auto px-4 md:px-0">
        {/* Featured (first) video - large */}
        {featuredVideo && (
          <motion.div
            initial={item.hidden}
            whileInView={item.visible}
            viewport={{ once: true }}
            className="max-w-md mx-auto mb-8"
          >
            <VideoCard video={featuredVideo} variant="portrait" showSound />
          </motion.div>
        )}

        {/* Rest in smaller grid */}
        {restVideos.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {restVideos.map((video, i) => (
              <motion.div key={video.id} variants={item}>
                <VideoCard video={video} variant="portrait" showSound={i === 0} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8 px-4 md:px-0">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 min-h-[44px] rounded-xl border border-border-glow text-white hover:border-accent-green hover:text-accent-green transition-colors text-sm font-medium"
          >
            {showAll ? (
              <>Show Less <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>View All ({videos.length}) <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Layout: Carousel (default) - horizontal scroll with snap
// On mobile: uses CSS scroll instead of framer-motion whileInView on children
// to avoid IntersectionObserver failures inside overflow containers.
// ---------------------------------------------------------------------------

function CarouselLayout({ videos, background, animations }: Omit<ShortVideosProps, 'layout'>) {
  const isMobile = useIsMobile(768);
  const { item } = getCardVariants(animations, isMobile);
  const [showAll, setShowAll] = useState(false);
  const visibleVideos = showAll ? videos : videos.slice(0, INITIAL_COUNT);
  const hasMore = videos.length > INITIAL_COUNT;

  return (
    <section className="py-4 md:py-6 lg:py-8" style={getSectionStyle(background)}>
      <SectionTitle text="Short Videos" highlight="Videos" />

      {/* Animate the section into view, but children are immediately visible */}
      <motion.div
        initial={item.hidden}
        whileInView={item.visible}
        viewport={{ once: true, amount: 0.05 }}
        className={`mt-12 flex gap-3 md:gap-6 px-4 md:px-0 max-w-7xl mx-auto ${
          showAll
            ? "flex-wrap justify-center"
            : "overflow-x-auto md:overflow-visible md:justify-center pb-4 snap-x snap-mandatory"
        }`}
        style={showAll ? undefined : { scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {visibleVideos.map((video, i) => (
          <div
            key={video.id}
            className={`flex-shrink-0 w-[75vw] max-w-[340px] sm:w-[300px] md:w-[320px] ${showAll ? "" : "snap-center"}`}
          >
            <VideoCard video={video} variant="portrait" showSound={i === 1} />
          </div>
        ))}
      </motion.div>

      {hasMore && (
        <div className="flex justify-center mt-8 px-4 md:px-0">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 min-h-[44px] rounded-xl border border-border-glow text-white hover:border-accent-green hover:text-accent-green transition-colors text-sm font-medium"
          >
            {showAll ? (
              <>Show Less <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>View All ({videos.length}) <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function ShortVideos({ videos, background, animations, layout = 'carousel' }: ShortVideosProps) {
  if (videos.length === 0) return null;

  if (layout === 'grid') return <GridLayout videos={videos} background={background} animations={animations} />;
  if (layout === 'featured') return <FeaturedLayout videos={videos} background={background} animations={animations} />;
  return <CarouselLayout videos={videos} background={background} animations={animations} />;
}
