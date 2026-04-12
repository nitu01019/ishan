"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";
import VideoCard from "@/components/ui/VideoCard";
import { getSectionStyle } from "@/lib/section-style";
import { getCardVariants } from "@/lib/animation-config";
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
  const { container, item } = getCardVariants(animations);
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
        viewport={{ once: true, amount: 0.2 }}
        className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0 max-w-7xl mx-auto"
      >
        {visibleVideos.map((video, i) => (
          <motion.div key={video.id} variants={item}>
            <VideoCard video={video} variant="portrait" showSound={i === 1} />
          </motion.div>
        ))}
      </motion.div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border-glow text-white hover:border-accent-green hover:text-accent-green transition-colors text-sm font-medium"
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
  const { container, item } = getCardVariants(animations);
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
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
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
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border-glow text-white hover:border-accent-green hover:text-accent-green transition-colors text-sm font-medium"
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
// ---------------------------------------------------------------------------

function CarouselLayout({ videos, background, animations }: Omit<ShortVideosProps, 'layout'>) {
  const { container, item } = getCardVariants(animations);
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
        viewport={{ once: true, amount: 0.2 }}
        className={`mt-12 flex gap-6 px-4 md:px-0 max-w-7xl mx-auto ${
          showAll
            ? "flex-wrap justify-center"
            : "overflow-x-auto md:overflow-visible md:justify-center snap-x snap-mandatory"
        }`}
      >
        {visibleVideos.map((video, i) => (
          <motion.div
            key={video.id}
            variants={item}
            className={`flex-shrink-0 w-[280px] md:w-[300px] ${showAll ? "" : "snap-center"}`}
          >
            <VideoCard video={video} variant="portrait" showSound={i === 1} />
          </motion.div>
        ))}
      </motion.div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border-glow text-white hover:border-accent-green hover:text-accent-green transition-colors text-sm font-medium"
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
