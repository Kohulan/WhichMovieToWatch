/**
 * ShareButton.tsx
 * Floating share FAB — appears on Discovery page when a movie is loaded.
 * Uses native Web Share API on mobile; falls back to custom ShareMenu on desktop.
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Share2 } from 'lucide-react';
import { useShare } from '@/hooks/useShare';
import { ShareMenu } from './ShareMenu';
import type { StoryCardMovie } from './StoryCardGenerator';

interface ShareButtonProps {
  movie: StoryCardMovie;
}

const SHARE_URL_BASE = 'https://www.whichmovieto.watch/#/discover?movie=';

export function ShareButton({ movie }: ShareButtonProps) {
  const { canNativeShare, share } = useShare();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleClick() {
    if (canNativeShare) {
      const shareUrl = `${SHARE_URL_BASE}${movie.id}`;
      const success = await share({
        title: movie.title,
        text: `Check out ${movie.title}!`,
        url: shareUrl,
      });
      // If native share failed or returned false, open custom menu as fallback
      if (!success) {
        setMenuOpen(true);
      }
    } else {
      setMenuOpen(true);
    }
  }

  return (
    <>
      <motion.button
        onClick={handleClick}
        className="fixed bottom-24 right-4 z-30 w-12 h-12 rounded-full shadow-lg flex items-center justify-center bg-clay-accent text-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Share this movie"
        title="Share this movie"
      >
        <Share2 className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {menuOpen && (
          <ShareMenu movie={movie} onClose={() => setMenuOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
