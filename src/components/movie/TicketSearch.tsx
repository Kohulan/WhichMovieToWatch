// Ticket search — Google search for movie tickets in user's area

import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Ticket, Search, ExternalLink as ExternalLinkIcon } from 'lucide-react';
import { ExternalLink } from '@/components/shared/ExternalLink';

interface TicketSearchProps {
  movieTitle: string;
  releaseYear?: string;
}

/**
 * TicketSearch — Search for movie tickets via Google.
 *
 * Shows a compact search bar pre-filled with the movie title.
 * User can optionally add their city/area before searching.
 * Opens Google search in a new tab with "buy [title] tickets near me".
 */
export function TicketSearch({ movieTitle, releaseYear }: TicketSearchProps) {
  const defaultQuery = releaseYear
    ? `${movieTitle} (${releaseYear})`
    : movieTitle;
  const [query, setQuery] = useState(defaultQuery);

  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `buy ${query} movie tickets near me`,
  )}`;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    },
    [searchUrl],
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Ticket className="w-4 h-4 text-accent" aria-hidden="true" />
        <h3 className="text-sm font-heading font-semibold text-clay-text">
          Find Tickets
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-clay-text-muted pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Movie name + your city..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/10 text-clay-text text-sm font-body placeholder:text-clay-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/30 transition-all"
            aria-label="Search for movie tickets"
          />
        </div>

        <motion.button
          type="submit"
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold cursor-pointer"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            boxShadow:
              '4px 4px 8px rgba(0,0,0,0.20), -2px -2px 5px rgba(255,255,255,0.05), inset -1px -1px 3px rgba(0,0,0,0.12), inset 1px 1px 3px rgba(255,255,255,0.18)',
          }}
          aria-label={`Search for ${query} tickets`}
        >
          <ExternalLinkIcon className="w-3.5 h-3.5" aria-hidden="true" />
          Search
        </motion.button>
      </form>
    </div>
  );
}
