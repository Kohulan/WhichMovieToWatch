"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface GenrePillProps {
  name: string;
  active?: boolean;
  onClick?: () => void;
}

export function GenrePill({ name, active = false, onClick }: GenrePillProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer",
        "border border-[var(--border-subtle)]",
        active
          ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]"
          : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {name}
    </motion.button>
  );
}
