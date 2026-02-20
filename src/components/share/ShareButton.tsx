/**
 * ShareButton.tsx
 * Inline share button — appears in the poster footer on the Discovery page.
 * Mobile: native Web Share API (link only). Desktop: custom ShareMenu.
 */

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Share2 } from "lucide-react";
import { useShare } from "@/hooks/useShare";
import { ShareMenu } from "./ShareMenu";
import type { StoryCardMovie } from "./StoryCardGenerator";

interface ShareButtonProps {
  movie: StoryCardMovie;
}

const SHARE_URL_BASE = "https://www.whichmovietowatch.online/#/discover?movie=";

/** Touch device = mobile/tablet → use native share sheet */
const isMobile =
  typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;

export function ShareButton({ movie }: ShareButtonProps) {
  const { canNativeShare, share } = useShare();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleClick() {
    // Mobile with native share: open OS share sheet (link only)
    if (isMobile && canNativeShare) {
      const shareUrl = `${SHARE_URL_BASE}${movie.id}`;
      await share({
        title: movie.title,
        text: `Check out ${movie.title}!`,
        url: shareUrl,
      });
      return;
    }

    // Desktop (or no native share): always show custom menu
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
