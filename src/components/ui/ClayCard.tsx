"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";
import { ANIMATION_CONFIG } from "@/lib/constants";

interface ClayCardProps extends HTMLMotionProps<"div"> {
  size?: "default" | "small" | "large" | "wide" | "tall";
  interactive?: boolean;
  glow?: boolean;
  className?: string;
}

const sizeClasses: Record<string, string> = {
  default: "",
  small: "clay-card-sm",
  large: "col-span-1 row-span-1 md:col-span-2 md:row-span-2",
  wide: "col-span-1 md:col-span-2",
  tall: "row-span-1 md:row-span-2",
};

export function ClayCard({
  size = "default",
  interactive = true,
  glow = false,
  className,
  children,
  ...props
}: ClayCardProps) {
  return (
    <motion.div
      className={cn(
        size === "small" ? "clay-card-sm" : "clay-card",
        sizeClasses[size],
        glow && "hover:[box-shadow:var(--clay-shadow-hover),var(--glow-primary)]",
        "overflow-hidden",
        className
      )}
      whileHover={interactive ? { scale: 1.02 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      transition={ANIMATION_CONFIG.spring.snappy}
      {...props}
    >
      {children}
    </motion.div>
  );
}
