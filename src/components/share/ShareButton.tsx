/**
 * ShareButton.tsx
 * Inline share button — appears in the poster footer on the Discovery page.
 * Mobile: native Web Share API (link only). Desktop: custom ShareMenu.
 */

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Share2 } from "lucide-react";
import { ShareMenu } from "./ShareMenu";
import type { StoryCardMovie } from "./StoryCardGenerator";

interface ShareButtonProps {
  movie: StoryCardMovie;
}

const SHARE_URL_BASE = "https://www.whichmovietowatch.online/#/discover?movie=";

export function ShareButton({ movie }: ShareButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function handleClick() {
    setMenuOpen(true);
  }

  return (
    <>
      <motion.button
        onClick={handleClick}
        className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/10 text-clay-text-muted font-medium text-sm hover:bg-white/[0.10] hover:text-clay-text transition-colors cursor-pointer"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        aria-label="Share this movie"
        title="Share this movie"
      >
        <Share2 className="w-4 h-4" />
        Share
      </motion.button>

      <AnimatePresence>
        {menuOpen && (
          <ShareMenu movie={movie} onClose={() => setMenuOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
