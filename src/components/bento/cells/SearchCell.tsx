// SearchCell — Feature CTA for Advanced Search.
//
// Designed as col-span-4, row-span-1 on desktop.
// Clay material cell. Click navigates to /discover (fallback — SearchModal
// open mechanism not directly accessible from a cell component context).

import { useNavigate } from 'react-router';
import { Search, ArrowRight } from 'lucide-react';

export function SearchCell() {
  const navigate = useNavigate();

  return (
    <div
      className="w-full h-full flex items-center gap-4 p-4"
      onClick={() => navigate('/discover')}
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center">
        <Search className="w-6 h-6 text-accent" aria-hidden="true" />
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-heading text-base font-semibold text-clay-text leading-tight">
          Advanced Search
        </h3>
        <p className="text-xs text-clay-text-muted mt-0.5 leading-snug">
          Filter by genre, year, rating, and more
        </p>
      </div>

      {/* Arrow */}
      <ArrowRight
        className="flex-shrink-0 w-4 h-4 text-clay-text-muted"
        aria-hidden="true"
      />
    </div>
  );
}
