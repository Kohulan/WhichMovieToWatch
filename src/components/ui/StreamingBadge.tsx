"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { StreamingProvider } from "@/types/movie";
import { tmdbImage } from "@/lib/constants";

interface StreamingBadgeProps {
  provider: StreamingProvider;
  link?: string;
}

export function StreamingBadge({ provider, link }: StreamingBadgeProps) {
  const content = (
    <motion.div
      className="relative h-10 w-10 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]"
      whileHover={{ scale: 1.15, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      title={provider.provider_name}
    >
      <Image
        src={tmdbImage(provider.logo_path, "w92")}
        alt={provider.provider_name}
        fill
        className="object-cover"
        sizes="40px"
      />
    </motion.div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}

interface StreamingBadgesProps {
  providers: StreamingProvider[];
  link?: string;
}

export function StreamingBadges({ providers, link }: StreamingBadgesProps) {
  if (!providers || providers.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--text-muted)] mr-1">Stream on</span>
      {providers.slice(0, 5).map((p) => (
        <StreamingBadge key={p.provider_id} provider={p} link={link} />
      ))}
    </div>
  );
}
