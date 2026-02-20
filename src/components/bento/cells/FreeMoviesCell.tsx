// FreeMoviesCell — Feature CTA for Free Movies section.
//
// Designed as col-span-4, row-span-1 on desktop.
// Clay material cell. Click navigates to /free-movies.

import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Film, ArrowRight } from "lucide-react";

export function FreeMoviesCell() {
  const navigate = useNavigate();

  return (
    <div
      className="w-full h-full flex items-center gap-4 p-4"
      onClick={() => navigate("/free-movies")}
    >
      {/* Icon with film reel spin */}
      <motion.div
        className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <Film className="w-6 h-6 text-accent" aria-hidden="true" />
      </motion.div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-heading text-base font-semibold text-clay-text leading-tight">
          Free Movies
        </h3>
        <p className="text-xs text-clay-text-muted mt-0.5 leading-snug">
          1,000+ movies free on YouTube
        </p>
      </div>

      {/* Arrow */}
      <ArrowRight
        className="flex-shrink-0 w-4 h-4 text-clay-text-muted"
        aria-hidden="true"
      />
    </div>
  );
}
