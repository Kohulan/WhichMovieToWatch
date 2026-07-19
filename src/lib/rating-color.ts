// Shared rating-score → color mapping for vote-average badges.
//
// Single source of truth so the good/mid/bad thresholds and hues live in one
// place instead of being copy-pasted across every result grid. Colors resolve
// to the --color-score-* theme tokens (see app.css), so retuning them is a
// one-line change that applies everywhere.

/**
 * Returns Tailwind classes for a rating badge given a 0–10 vote average.
 * ≥70% good, ≥50% mid, else bad. The /80 keeps the badge slightly translucent
 * over poster art, matching the long-standing badge look.
 */
export function ratingColorClass(voteAverage: number): string {
  const pct = Math.round(voteAverage * 10);
  if (pct >= 70) return "bg-score-good/80 text-white";
  if (pct >= 50) return "bg-score-mid/80 text-white";
  return "bg-score-bad/80 text-white";
}
