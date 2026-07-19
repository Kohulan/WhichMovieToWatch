// Genre clay pill chip selection for onboarding

import { useState } from "react";
import { getAllGenres } from "@/lib/genre-map";
import { ClayBadge } from "@/components/ui";

interface GenreSelectorProps {
  selectedGenre: string | null;
  onGenreChange: (genreId: string | null) => void;
}

// The handful of genres most people reach for first. Leading with these keeps
// the initial decision within working-memory limits; the long tail lives
// behind "More genres" so the picker isn't a 19-chip wall on first open.
const COMMON_GENRE_IDS = new Set([28, 35, 18, 878, 27, 10749]);

/**
 * GenreSelector — Clay pill chip grid for single genre selection.
 *
 * Shows "Any" option at the top (selects null = no filtering).
 * Each genre is a ClayBadge — accent when selected, muted when not.
 * Tapping the already-selected genre reverts to "Any". (PREF-04)
 */
export function GenreSelector({
  selectedGenre,
  onGenreChange,
}: GenreSelectorProps) {
  const genres = getAllGenres();
  const [showAll, setShowAll] = useState(false);

  const common = genres.filter((g) => COMMON_GENRE_IDS.has(g.id));
  const rest = genres.filter((g) => !COMMON_GENRE_IDS.has(g.id));

  // A selected genre from the long tail must stay visible even while collapsed,
  // or the user can't see (or un-tap) their own choice.
  const selectedInRest = rest.find((g) => String(g.id) === selectedGenre);
  const visibleGenres = showAll
    ? genres
    : [...common, ...(selectedInRest ? [selectedInRest] : [])];

  function handleSelect(genreId: string | null) {
    // Tapping the already-selected genre reverts to "Any"
    if (genreId === selectedGenre) {
      onGenreChange(null);
    } else {
      onGenreChange(genreId);
    }
  }

  return (
    <div
      className="flex flex-wrap gap-2"
      role="listbox"
      aria-label="Genre selection"
      aria-multiselectable="false"
    >
      {/* "Any" option */}
      <button
        role="option"
        aria-selected={selectedGenre === null}
        className="focus:outline-none focus:ring-2 focus:ring-clay-accent rounded-full"
        onClick={() => handleSelect(null)}
      >
        <span role="listitem">
          <ClayBadge
            variant={selectedGenre === null ? "accent" : "muted"}
            size="md"
            className="cursor-pointer select-none transition-all"
          >
            Any
          </ClayBadge>
        </span>
      </button>

      {visibleGenres.map((genre) => {
        const isSelected = selectedGenre === String(genre.id);

        return (
          <button
            key={genre.id}
            role="option"
            aria-selected={isSelected}
            className="focus:outline-none focus:ring-2 focus:ring-clay-accent rounded-full"
            onClick={() => handleSelect(String(genre.id))}
          >
            <span role="listitem">
              <ClayBadge
                variant={isSelected ? "accent" : "muted"}
                size="md"
                className="cursor-pointer select-none transition-all"
              >
                {genre.name}
              </ClayBadge>
            </span>
          </button>
        );
      })}

      {/* Long-tail disclosure — keeps the first decision small */}
      {rest.length > 0 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          aria-expanded={showAll}
          className="focus:outline-none focus:ring-2 focus:ring-clay-accent rounded-full"
        >
          <ClayBadge
            variant="muted"
            size="md"
            className="cursor-pointer select-none transition-all opacity-80"
          >
            {showAll ? "Show fewer" : "More genres"}
          </ClayBadge>
        </button>
      )}
    </div>
  );
}
