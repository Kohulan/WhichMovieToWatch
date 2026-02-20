import { motion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";
import { useThemeStore } from "@/stores/themeStore";

type ClayCardElement = "div" | "section" | "article";

interface ClayCardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  as?: ClayCardElement;
}

/**
 * ClayCard — Glassmorphic surface card with subtle hover animations.
 * In light mode, adds a subtle ceramic concentric ripple texture.
 */
export function ClayCard({
  children,
  className = "",
  elevated = true,
  as = "div",
}: ClayCardProps) {
  const MotionComponent = motion[as] as React.ComponentType<
    HTMLMotionProps<typeof as>
  >;
  const isDark = useThemeStore((s) => s.mode === "dark");

  return (
    <MotionComponent
      className={`
        bg-white/[0.06] backdrop-blur-xl
        border border-white/10
        rounded-2xl
        relative overflow-hidden
        transition-colors duration-300
        ${elevated ? "shadow-lg shadow-black/10" : ""}
        ${!isDark ? "ceramic-ripple" : ""}
        ${className}
      `}
      whileHover={{
        y: -2,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      whileTap={{
        y: 1,
        scale: 0.99,
        transition: { type: "spring", stiffness: 400, damping: 25 },
      }}
    >
      {children}
    </MotionComponent>
  );
}
