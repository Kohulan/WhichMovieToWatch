// Genre clay pill chip selection for onboarding

import { getAllGenres } from "@/lib/genre-map";
import { ClayBadge } from "@/components/ui";

interface GenreSelectorProps {
  selectedGenre: string | null;
  onGenreChange: (genreId: string | null) => void;
}

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

      {genres.map((genre) => {
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
    </div>
  );
}
