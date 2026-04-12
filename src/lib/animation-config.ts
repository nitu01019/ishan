import type { AnimationConfig } from "@/types";

export function getCardVariants(config?: AnimationConfig) {
  const entrance = config?.cardEntrance ?? "fade-up";

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  let item;
  switch (entrance) {
    case "slide-in":
      item = {
        hidden: { opacity: 0, x: -40 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: 0.5, ease: "easeOut" },
        },
      };
      break;
    case "scale":
      item = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: { duration: 0.4, ease: "easeOut" },
        },
      };
      break;
    case "flip":
      item = {
        hidden: { opacity: 0, rotateY: 90 },
        visible: {
          opacity: 1,
          rotateY: 0,
          transition: { duration: 0.6, ease: "easeOut" },
        },
      };
      break;
    case "none":
      item = {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
      };
      break;
    case "fade-up":
    default:
      item = {
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: "easeOut" },
        },
      };
  }

  return { container, item };
}

export function getButtonHoverProps(config?: AnimationConfig) {
  const hover = config?.buttonHover ?? "glow";
  switch (hover) {
    case "lift":
      return { whileHover: { y: -4, transition: { duration: 0.2 } } };
    case "pulse":
      return {
        whileHover: {
          scale: [1, 1.05, 1],
          transition: { repeat: Infinity, duration: 0.8 },
        },
      };
    case "none":
      return {};
    case "glow":
    default:
      return {
        whileHover: { scale: 1.02, transition: { duration: 0.2 } },
      };
  }
}

export function getScrollSpeed(config?: AnimationConfig): number {
  const speed = config?.scrollSpeed ?? "medium";
  switch (speed) {
    case "slow":
      return 60;
    case "fast":
      return 20;
    case "medium":
    default:
      return 40;
  }
}
