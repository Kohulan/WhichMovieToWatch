"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";
import { ANIMATION_CONFIG } from "@/lib/constants";

interface ClayButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "accent" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const variantClasses: Record<string, string> = {
  primary:
    "clay-button bg-[var(--accent-primary)] text-white",
  secondary:
    "clay-button bg-[var(--bg-elevated)] text-[var(--text-primary)]",
  accent:
    "clay-button bg-[var(--accent-warm)] text-white",
  ghost:
    "bg-transparent border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-[var(--clay-radius-sm)] cursor-pointer transition-colors",
};

const sizeClasses: Record<string, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3.5 text-lg",
};

export function ClayButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ClayButtonProps) {
  return (
    <motion.button
      className={cn(variantClasses[variant], sizeClasses[size], "font-medium", className)}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={ANIMATION_CONFIG.spring.snappy}
      {...props}
    >
      {children}
    </motion.button>
  );
}
