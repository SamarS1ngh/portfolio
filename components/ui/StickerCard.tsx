"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { type ReactNode, forwardRef } from "react";

type StickerCardProps = HTMLMotionProps<"div"> & {
  rotate?: number;
  draggable?: boolean;
  children: ReactNode;
  className?: string;
};

export const StickerCard = forwardRef<HTMLDivElement, StickerCardProps>(
  ({ rotate = 0, draggable = false, children, className = "", ...rest }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ rotate, scale: 0.95, opacity: 0 }}
        animate={{ rotate, scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.03, y: -4, rotate: rotate * 0.5 }}
        whileTap={{ scale: 0.98 }}
        drag={draggable}
        dragElastic={0.6}
        dragMomentum
        dragConstraints={{ top: -60, bottom: 60, left: -120, right: 120 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className={`relative shadow-sticker hover:shadow-stickerHover ${className} ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
        style={{
          transformOrigin: "center",
          willChange: "transform",
        }}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }
);

StickerCard.displayName = "StickerCard";
