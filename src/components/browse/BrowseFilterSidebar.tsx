import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, SlidersHorizontal } from "lucide-react";
import { useBrowseStore } from "@/stores/browseStore";
import { MetalCheckbox, MetalButton, MetalDropdown } from "@/components/ui";
import { DualRangeSlider } from "@/components/shared/DualRangeSlider";
import { getAllGenres } from "@/lib/genre-map";
import { hasNonDefaultFilters } from "@/services/tmdb/browse";

const CURRENT_YEAR = new Date().getFullYear();

const LANGUAGES = [
  { value: "", label: "Any language" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "hi", label: "Hindi" },
  { value: "zh", label: "Chinese" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
];

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

interface BrowseFilterSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function BrowseFilterSidebar({
  open,
  onClose,
}: BrowseFilterSidebarProps) {
  const filters = useBrowseStore((s) => s.filters);
  const setFilters = useBrowseStore((s) => s.setFilters);
  const resetFilters = useBrowseStore((s) => s.resetFilters);

  const allGenres = getAllGenres();
  const filtersActive = hasNonDefaultFilters(filters);

  // Count active filters for badge
  const activeCount = [
    filters.genres.length > 0,
    filters.ratingRange[0] !== 0 || filters.ratingRange[1] !== 10,
    filters.yearRange[0] !== 1900 || filters.yearRange[1] !== CURRENT_YEAR,
    filters.language !== null,
    filters.runtimeRange[0] !== 0 || filters.runtimeRange[1] !== 300,
  ].filter(Boolean).length;

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleGenreToggle = useCallback(
    (genreId: number, checked: boolean) => {
      const current = filters.genres;
      const updated = checked
        ? [...current, genreId]
        : current.filter((id) => id !== genreId);
      setFilters({ genres: updated });
    },
    [filters.genres, setFilters],
  );

  const handleClear = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="filter-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Sidebar — slides in from left */}
          <motion.aside
            key="filter-panel"
            initial={{ x: "-100%", opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0.8 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            aria-label="Filter panel"
            className="
              fixed top-0 left-0 bottom-0 z-50
              w-[280px] sm:w-[320px]
              bg-clay-base/95 backdrop-blur-xl
              border-r border-white/[0.1]
              flex flex-col
            "
            style={{
              boxShadow:
                "12px 0 48px rgba(0,0,0,0.3), 4px 0 16px rgba(0,0,0,0.15), inset -1px 0 0 rgba(255,255,255,0.04)",
            }}
          >
            {/* Header — with icon and active count */}
            <div className="flex items-center justify-between px-5 pt-[env(safe-area-inset-top)] mt-4 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-clay-surface clay-shadow-sm">
                  <SlidersHorizontal
                    className="w-4 h-4 text-accent"
                    aria-hidden="true"
                  />
                </div>
                <span className="text-sm font-heading font-semibold text-clay-text">
                  Filters
                </span>
                {activeCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold">
                    {activeCount}
                  </span>
                )}
              </div>
              <motion.button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 -mr-1.5 rounded-full text-clay-text-muted hover:text-clay-text transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Divider */}
            <div className="mx-5 border-t border-white/[0.06] mb-1" />

            {/* Filter content — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-6 pt-4">
              {/* Genre multi-select */}
              <div>
                <p className="font-heading text-xs font-semibold text-clay-text-muted uppercase tracking-wider mb-3">
                  Genre
                </p>
                <div className="flex flex-wrap gap-2">
                  {allGenres.map((genre) => (
                    <MetalCheckbox
                      key={genre.id}
                      checked={filters.genres.includes(genre.id)}
                      onChange={(checked) =>
                        handleGenreToggle(genre.id, checked)
                      }
                      label={genre.name}
                    />
                  ))}
                </div>
              </div>

              {/* Section divider */}
              <div className="border-t border-white/[0.04]" />

              {/* Rating range */}
              <DualRangeSlider
                label="Rating"
                min={0}
                max={10}
                step={0.5}
                value={filters.ratingRange}
                onChange={(range) => setFilters({ ratingRange: range })}
                formatValue={(v) => v.toFixed(1)}
              />

              {/* Release year range */}
              <DualRangeSlider
                label="Release Year"
                min={1900}
                max={CURRENT_YEAR}
                step={1}
                value={filters.yearRange}
                onChange={(range) => setFilters({ yearRange: range })}
              />

              {/* Section divider */}
              <div className="border-t border-white/[0.04]" />

              {/* Language */}
              <MetalDropdown
                label="Language"
                options={LANGUAGES}
                value={filters.language ?? ""}
                onChange={(val) =>
                  setFilters({ language: val === "" ? null : val })
                }
                placeholder="Any language"
              />

              {/* Runtime range */}
              <DualRangeSlider
                label="Runtime"
                min={0}
                max={300}
                step={15}
                value={filters.runtimeRange}
                onChange={(range) => setFilters({ runtimeRange: range })}
                formatValue={formatRuntime}
              />
            </div>

            {/* Footer — Clear Filters with accent style when active */}
            <div className="px-5 py-3 border-t border-white/[0.06]">
              <MetalButton
                variant={filtersActive ? "primary" : "ghost"}
                size="sm"
                onClick={handleClear}
                disabled={!filtersActive}
                className="w-full"
              >
                {filtersActive
                  ? `Clear ${activeCount} Filter${activeCount !== 1 ? "s" : ""}`
                  : "No active filters"}
              </MetalButton>
            </div>

            {/* Safe area bottom padding */}
            <div className="pb-[env(safe-area-inset-bottom)]" />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
