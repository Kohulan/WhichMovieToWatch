import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useBrowseStore } from "@/stores/browseStore";
import { MetalCheckbox, MetalButton, MetalDropdown } from "@/components/ui";
import { DualRangeSlider } from "@/components/shared/DualRangeSlider";
import { getAllGenres } from "@/lib/genre-map";

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
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Sidebar — slides in from left */}
          <motion.div
            key="filter-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="
              fixed top-0 left-0 bottom-0 z-50
              w-72 sm:w-80
              bg-clay-base/95 backdrop-blur-md
              border-r border-white/[0.12]
              shadow-[8px_0_40px_rgba(0,0,0,0.25)]
              flex flex-col
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-[env(safe-area-inset-top)] mt-4 mb-2">
              <span className="text-sm font-semibold text-clay-text">
                Filters
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="p-1.5 -mr-1.5 rounded-full text-clay-text-muted hover:text-clay-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter content — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5">
              {/* Genre multi-select */}
              <div>
                <p className="font-body text-sm font-medium text-clay-text mb-2">
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

            {/* Footer — Clear Filters */}
            <div className="px-5 py-3 border-t border-white/[0.08]">
              <MetalButton
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="w-full"
              >
                Clear Filters
              </MetalButton>
            </div>

            {/* Safe area bottom padding */}
            <div className="pb-[env(safe-area-inset-bottom)]" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
