/**
 * ShareMenu.tsx
 * Custom share menu with copy link, Instagram story, create post, Twitter/X, WhatsApp.
 * Shown on desktop (or when native Web Share API is unavailable).
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Link,
  Image,
  Square,
  Twitter,
  MessageCircle,
  X,
  Share2,
} from "lucide-react";
import {
  generateStoryCard,
  generatePostCard,
  shareImageBlob,
} from "./StoryCardGenerator";
import type { StoryCardMovie } from "./StoryCardGenerator";
import { useShare } from "@/hooks/useShare";
import { useThemeStore } from "@/stores/themeStore";
import { showToast } from "@/components/shared/Toast";

interface ShareMenuProps {
  movie: StoryCardMovie;
  onClose: () => void;
}

const SHARE_URL_BASE = "https://www.whichmovietowatch.online/#/discover?movie=";

export function ShareMenu({ movie, onClose }: ShareMenuProps) {
  const { copyToClipboard } = useShare();
  const { preset, mode } = useThemeStore();
  const [generatingStory, setGeneratingStory] = useState(false);
  const [generatingPost, setGeneratingPost] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const shareUrl = `${SHARE_URL_BASE}${movie.id}`;

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Focus trap — move focus into panel on mount
  useEffect(() => {
    const firstButton = panelRef.current?.querySelector("button");
    firstButton?.focus();
  }, []);

  async function handleCopyLink() {
    const ok = await copyToClipboard(shareUrl);
    showToast(
      ok ? "Link copied!" : "Failed to copy link",
      ok ? "success" : "error",
    );
    onClose();
  }

  async function handleStoryCard() {
    setGeneratingStory(true);
    try {
      const blob = await generateStoryCard(movie, preset, mode);
      if (!blob) {
        showToast("Failed to generate story card.", "error");
        return;
      }
      const slug = movie.title.replace(/\s+/g, "-").toLowerCase();
      const result = await shareImageBlob(
        blob,
        movie.title,
        `${slug}-story.png`,
      );
      if (result === "copied") {
        showToast("Story card copied! Paste it into Instagram.", "success");
      } else if (result === "downloaded") {
        showToast("Story card downloaded! Upload it to Instagram.", "success");
      }
    } catch {
      showToast("Failed to generate story card.", "error");
    } finally {
      setGeneratingStory(false);
      onClose();
    }
  }

  async function handlePostCard() {
    setGeneratingPost(true);
    try {
      const blob = await generatePostCard(movie, preset, mode);
      if (!blob) {
        showToast("Failed to generate post card.", "error");
        return;
      }
      const slug = movie.title.replace(/\s+/g, "-").toLowerCase();
      const result = await shareImageBlob(
        blob,
        movie.title,
        `${slug}-post.png`,
      );
      if (result === "copied") {
        showToast("Post card copied! Paste it into your feed.", "success");
      } else if (result === "downloaded") {
        showToast("Post card downloaded! Upload it to your feed.", "success");
      }
    } catch {
      showToast("Failed to generate post card.", "error");
    } finally {
      setGeneratingPost(false);
      onClose();
    }
  }

  function handleTwitter() {
    const text = encodeURIComponent(
      `Check out ${movie.title} on Which Movie To Watch!`,
    );
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener",
    );
    onClose();
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(`Check out ${movie.title}! ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
    onClose();
  }

  async function handleNativeShare() {
    try {
      await navigator.share({
        title: movie.title,
        text: `Check out ${movie.title}!`,
        url: shareUrl,
      });
    } catch {
      // user cancelled
    }
    onClose();
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      aria-label="Share menu backdrop"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-label="Share movie"
        aria-modal="true"
        className="relative z-10 w-full max-w-sm mb-6 mx-4 rounded-2xl bg-clay-surface border border-clay-border clay-shadow-lg overflow-hidden"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-clay-border">
          <span className="text-clay-text font-semibold text-sm">
            Share &ldquo;{movie.title}&rdquo;
          </span>
          <button
            onClick={onClose}
            className="text-clay-text-muted hover:text-clay-text transition-colors p-1 rounded-lg cursor-pointer"
            aria-label="Close share menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="py-2">
          {typeof navigator !== "undefined" && !!navigator.share && (
            <ShareMenuItem
              icon={<Share2 className="w-5 h-5" />}
              label="Share Link"
              subtitle="Native share sheet"
              onClick={handleNativeShare}
            />
          )}
          <ShareMenuItem
            icon={<Link className="w-5 h-5" />}
            label="Copy Link"
            onClick={handleCopyLink}
          />
          <ShareMenuItem
            icon={<Image className="w-5 h-5" />}
            label={generatingStory ? "Generating..." : "Instagram Story"}
            subtitle="9:16 story card"
            onClick={handleStoryCard}
            disabled={generatingStory}
          />
          <ShareMenuItem
            icon={<Square className="w-5 h-5" />}
            label={generatingPost ? "Generating..." : "Create Post"}
            subtitle="1:1 square card"
            onClick={handlePostCard}
            disabled={generatingPost}
          />
          <ShareMenuItem
            icon={<Twitter className="w-5 h-5" />}
            label="Twitter / X"
            onClick={handleTwitter}
          />
          <ShareMenuItem
            icon={<MessageCircle className="w-5 h-5" />}
            label="WhatsApp"
            onClick={handleWhatsApp}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

interface ShareMenuItemProps {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onClick: () => void;
  disabled?: boolean;
}

function ShareMenuItem({
  icon,
  label,
  subtitle,
  onClick,
  disabled = false,
}: ShareMenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-4 w-full px-5 py-3.5 text-clay-text hover:bg-clay-base/60 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="text-clay-accent flex-shrink-0">{icon}</span>
      <div className="text-left">
        <span className="text-sm font-medium block">{label}</span>
        {subtitle && (
          <span className="text-xs text-clay-text-muted">{subtitle}</span>
        )}
      </div>
    </button>
  );
}
