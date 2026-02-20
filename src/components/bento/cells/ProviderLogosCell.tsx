// ProviderLogosCell — Animated provider logo shuffle.
//
// Fetches all streaming providers for the user's region, shows 3 at a time,
// and shuffles to the next 3 every 2.5 seconds with a crossfade animation.
// Designed as col-span-3, row-span-1 on desktop. hideOnMobile=true (decorative).

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRegionProviders } from "@/hooks/useWatchProviders";

const TMDB_LOGO_BASE = "https://image.tmdb.org/t/p/original";
const VISIBLE_COUNT = 3;
const CYCLE_MS = 2500;

export function ProviderLogosCell() {
  const { providers, isLoading } = useRegionProviders();
  const [offset, setOffset] = useState(0);

  // Shuffle the providers once on load so the order varies per session
  const shuffled = useMemo(() => {
    if (providers.length === 0) return [];
    const copy = [...providers];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [providers]);

  // Advance the window every CYCLE_MS
  useEffect(() => {
    if (shuffled.length <= VISIBLE_COUNT) return;
    const timer = setInterval(() => {
      setOffset((prev) => (prev + VISIBLE_COUNT) % shuffled.length);
    }, CYCLE_MS);
    return () => clearInterval(timer);
  }, [shuffled.length]);

  // Current 3 visible providers (wraps around)
  const visible = useMemo(() => {
    if (shuffled.length === 0) return [];
    const result = [];
    for (let i = 0; i < VISIBLE_COUNT; i++) {
      result.push(shuffled[(offset + i) % shuffled.length]);
    }
    return result;
  }, [shuffled, offset]);

  return (
    <div className="w-full h-full flex flex-col justify-center p-4 gap-3">
      {/* Label */}
      <span className="text-xs font-semibold text-clay-text-muted uppercase tracking-wide">
        {isLoading ? "Loading..." : `${providers.length}+ Streaming Services`}
      </span>

      {/* Animated logo slots */}
      <div className="grid grid-cols-3 gap-2">
        <AnimatePresence mode="popLayout">
          {visible.map((provider) => (
            <motion.div
              key={provider.provider_id}
              className="aspect-square rounded-lg overflow-hidden bg-white/10 flex items-center justify-center"
              title={provider.provider_name}
              initial={{ opacity: 0, scale: 0.7, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.7, rotateY: -90 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <img
                src={`${TMDB_LOGO_BASE}${provider.logo_path}`}
                alt={provider.provider_name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
