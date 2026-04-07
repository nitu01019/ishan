"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import VideoCard from "@/components/ui/VideoCard";
import VideoLightbox from "@/components/ui/VideoLightbox";
import type { Video } from "@/types";

interface ShortVideosProps {
  readonly videos: readonly Video[];
}

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function ShortVideos({ videos }: ShortVideosProps) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  return (
    <section className="py-4 md:py-6 lg:py-8">
      <SectionTitle text="Short Videos" highlight="Videos" />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mt-12 flex gap-6 overflow-x-auto md:overflow-visible md:justify-center px-4 md:px-0 snap-x snap-mandatory max-w-7xl mx-auto"
      >
        {videos.map((video, i) => (
          <motion.div
            key={video.id}
            variants={item}
            className="flex-shrink-0 w-[280px] md:w-[300px] snap-center"
          >
            <VideoCard video={video} variant="portrait" showSound={i === 1} onPlay={() => setActiveVideo(video)} />
          </motion.div>
        ))}
      </motion.div>

      <VideoLightbox
        isOpen={activeVideo !== null}
        onClose={() => setActiveVideo(null)}
        videoUrl={activeVideo?.videoUrl ?? ""}
        posterUrl={activeVideo?.thumbnailUrl}
      />
    </section>
  );
}
