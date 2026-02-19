// Genre badges rendered as clay-styled pills (DISP-07)

import { ClayBadge } from '@/components/ui';

interface Genre {
  id: number;
  name: string;
}

interface GenreBadgesProps {
  genres: Genre[];
  maxVisible?: number;
}

/**
 * GenreBadges — Claymorphism-styled genre pill chips.
 *
 * Maps genres to muted ClayBadge components in a flex-wrap row.
 * Limits visible badges to maxVisible (default 4), shows "+N more" label
 * if genres are truncated. (DISP-07)
 */
export function GenreBadges({ genres, maxVisible = 4 }: GenreBadgesProps) {
  if (!genres || genres.length === 0) return null;

  const visible = genres.slice(0, maxVisible);
  const overflow = genres.length - maxVisible;

  return (
    <div className="flex flex-wrap gap-1.5" role="list" aria-label="Movie genres">
      {visible.map((genre) => (
        <span key={genre.id} role="listitem">
          <ClayBadge variant="muted" size="sm">
            {genre.name}
          </ClayBadge>
        </span>
      ))}
      {overflow > 0 && (
        <span role="listitem">
          <ClayBadge variant="muted" size="sm" className="opacity-60">
            +{overflow} more
          </ClayBadge>
        </span>
      )}
    </div>
  );
}
