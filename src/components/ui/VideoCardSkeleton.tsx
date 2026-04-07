"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface VideoCardSkeletonProps {
  variant?: "landscape" | "portrait";
}

export function VideoCardSkeleton({ variant = "landscape" }: VideoCardSkeletonProps) {
  return (
    <div className="rounded-2xl overflow-hidden border border-border-glow bg-white/[0.02]">
      <Skeleton
        className={
          variant === "portrait"
            ? "aspect-[9/16] w-full rounded-none"
            : "aspect-video w-full rounded-none"
        }
      />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export default VideoCardSkeleton;
