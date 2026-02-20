import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Film } from "lucide-react";

interface Quote {
  text: string;
  film: string;
}

/** Classic recognizable movie quotes for loading states (ANIM-06) */
const QUOTES: Quote[] = [
  { text: "Here's looking at you, kid.", film: "Casablanca" },
  { text: "May the Force be with you.", film: "Star Wars" },
  { text: "I'll be back.", film: "The Terminator" },
  { text: "To infinity and beyond!", film: "Toy Story" },
  { text: "Life is like a box of chocolates.", film: "Forrest Gump" },
  { text: "After all, tomorrow is another day.", film: "Gone with the Wind" },
  { text: "There's no place like home.", film: "The Wizard of Oz" },
  { text: "You talking to me?", film: "Taxi Driver" },
  { text: "I see dead people.", film: "The Sixth Sense" },
  { text: "Just keep swimming.", film: "Finding Nemo" },
  { text: "Why so serious?", film: "The Dark Knight" },
  { text: "I am Groot.", film: "Guardians of the Galaxy" },
];

interface LoadingQuotesProps {
  className?: string;
  /** 'sm' for compact contexts (search modal), 'md' for full-page loading (default) */
  size?: "sm" | "md";
}

/**
 * LoadingQuotes — Movie-themed loading state with rotating quotes and film-reel spinner.
 *
 * Replaces plain spinners during content-fetch loading states.
 * Picks a random starting quote on mount, then cycles sequentially every 4s.
 * Quotes fade in/out via AnimatePresence. Film-reel spinner uses film-reel-spin
 * CSS animation from animations.css. (ANIM-06)
 */
export function LoadingQuotes({
  className = "",
  size = "md",
}: LoadingQuotesProps) {
  const [quoteIndex, setQuoteIndex] = useState(() =>
    Math.floor(Math.random() * QUOTES.length),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const quote = QUOTES[quoteIndex];
  const iconSize = size === "sm" ? 20 : 24;
  const quoteClass =
    size === "sm"
      ? "text-clay-text/60 text-xs italic"
      : "text-clay-text/60 text-sm italic";
  const filmClass =
    size === "sm"
      ? "text-clay-text/40 text-[10px]"
      : "text-clay-text/40 text-xs";

  return (
    <motion.div
      className={`flex flex-col items-center gap-3 py-6 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Film-reel spinner */}
      <div className="film-reel-spin text-accent" aria-hidden="true">
        <Film width={iconSize} height={iconSize} strokeWidth={1.5} />
      </div>

      {/* Rotating movie quote with fade in/out */}
      <AnimatePresence mode="wait">
        <motion.div
          key={quoteIndex}
          className="flex flex-col items-center gap-1 text-center px-6 max-w-xs"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          <p className={quoteClass}>"{quote.text}"</p>
          <span className={filmClass}>— {quote.film}</span>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
