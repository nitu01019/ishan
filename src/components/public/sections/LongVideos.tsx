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

interface LongVideosProps {
  readonly videos: readonly Video[];
  readonly background?: SectionBackground;
  readonly animations?: AnimationConfig;
  readonly layout?: 'grid' | 'carousel' | 'featured';
}

const INITIAL_COUNT = 4;

// ---------------------------------------------------------------------------
// Layout: Carousel - horizontal scroll with snap
// ---------------------------------------------------------------------------

function CarouselLayout({ videos, background, animations }: Omit<LongVideosProps, 'layout'>) {
  const isMobile = useIsMobile(768);
  const { item } = getCardVariants(animations, isMobile);
  const [showAll, setShowAll] = useState(false);
  const visibleVideos = showAll ? videos : videos.slice(0, INITIAL_COUNT);
  const hasMore = videos.length > INITIAL_COUNT;

  return (
    <section className="pt-4 pb-8 md:pt-6 md:pb-12 lg:pt-8 lg:pb-16 max-w-7xl mx-auto px-4 md:px-6 lg:px-8" style={getSectionStyle(background)}>
      <SectionTitle text="Long Videos" highlight="Videos" />

      <motion.div
        initial={item.hidden}
        whileInView={item.visible}
        viewport={{ once: true, amount: 0.05 }}
        className={`mt-12 flex gap-4 md:gap-6 ${
          showAll
            ? "flex-wrap justify-center"
            : "overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0"
        }`}
        style={showAll ? undefined : { scrollbarWidth: "none" }}
      >
        {visibleVideos.map((video) => (
          <div
            key={video.id}
            className={`flex-shrink-0 w-[92vw] max-w-[640px] md:w-[48%] md:max-w-none ${showAll ? "" : "snap-center"}`}
          >
            <VideoCard video={video} variant="landscape" />
          </div>
        ))}
      </motion.div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 min-h-[48px] rounded-xl border border-border-glow text-white hover:border-accent-green hover:text-accent-green transition-colors text-sm font-medium"
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

function FeaturedLayout({ videos, background, animations }: Omit<LongVideosProps, 'layout'>) {
  const isMobile = useIsMobile(768);
  const { container, item } = getCardVariants(animations, isMobile);
  const [showAll, setShowAll] = useState(false);
  const featuredVideo = videos[0];
  const restVideos = showAll ? videos.slice(1) : videos.slice(1, INITIAL_COUNT);
  const hasMore = videos.length > INITIAL_COUNT;

  return (
    <section className="pt-4 pb-8 md:pt-6 md:pb-12 lg:pt-8 lg:pb-16 max-w-7xl mx-auto px-4 md:px-6 lg:px-8" style={getSectionStyle(background)}>
      <SectionTitle text="Long Videos" highlight="Videos" />

      <div className="mt-12">
        {/* Featured (first) video - full width */}
        {featuredVideo && (
          <motion.div
            initial={item.hidden}
            whileInView={item.visible}
            viewport={{ once: true }}
            className="mb-8"
          >
            <VideoCard video={featuredVideo} variant="landscape" />
          </motion.div>
        )}

        {/* Rest in smaller grid */}
        {restVideos.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-0"
          >
            {restVideos.map((video) => (
              <motion.div key={video.id} variants={item}>
                <VideoCard video={video} variant="landscape" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 min-h-[48px] rounded-xl border border-border-glow text-white hover:border-accent-green hover:text-accent-green transition-colors text-sm font-medium"
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
// Layout: Grid (default) - multi-column grid
// ---------------------------------------------------------------------------

function GridLayout({ videos, background, animations }: Omit<LongVideosProps, 'layout'>) {
  const isMobile = useIsMobile(768);
  const { container, item } = getCardVariants(animations, isMobile);
  const [showAll, setShowAll] = useState(false);
  const visibleVideos = showAll ? videos : videos.slice(0, INITIAL_COUNT);
  const hasMore = videos.length > INITIAL_COUNT;

  return (
    <section className="pt-4 pb-8 md:pt-6 md:pb-12 lg:pt-8 lg:pb-16 max-w-7xl mx-auto px-4 md:px-6 lg:px-8" style={getSectionStyle(background)}>
      <SectionTitle text="Long Videos" highlight="Videos" />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
      >
        {visibleVideos.map((video) => (
          <motion.div key={video.id} variants={item}>
            <VideoCard video={video} variant="landscape" />
          </motion.div>
        ))}
      </motion.div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 min-h-[48px] rounded-xl border border-border-glow text-white hover:border-accent-green hover:text-accent-green transition-colors text-sm font-medium"
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

export default function LongVideos({ videos, background, animations, layout = 'grid' }: LongVideosProps) {
  if (videos.length === 0) return null;

  if (layout === 'carousel') return <CarouselLayout videos={videos} background={background} animations={animations} />;
  if (layout === 'featured') return <FeaturedLayout videos={videos} background={background} animations={animations} />;
  return <GridLayout videos={videos} background={background} animations={animations} />;
}
