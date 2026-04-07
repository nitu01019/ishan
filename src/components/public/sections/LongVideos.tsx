"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import VideoCard from "@/components/ui/VideoCard";
import VideoLightbox from "@/components/ui/VideoLightbox";
import type { Video } from "@/types";

interface LongVideosProps {
  readonly videos: readonly Video[];
}

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function LongVideos({ videos }: LongVideosProps) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  return (
    <section className="pt-4 pb-8 md:pt-6 md:pb-12 lg:pt-8 lg:pb-16 max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
      <SectionTitle text="Long Videos" highlight="Videos" />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {videos.map((video) => (
          <motion.div key={video.id} variants={item}>
            <VideoCard video={video} variant="landscape" onPlay={() => setActiveVideo(video)} />
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
