// Interactive Mood and Time Budget chips for rapid couch decision-making

import { useDiscoveryStore } from "@/stores/discoveryStore";
import { useHaptics } from "@/hooks/useHaptics";
import { Clock, Sparkles, Brain, Smile, Flame, HeartCrack } from "lucide-react";

const RUNTIME_OPTIONS = [
  { label: "Any Length", max: null, min: null },
  { label: "< 90m", max: 90, min: null },
  { label: "< 105m", max: 105, min: null },
  { label: "120m+", max: null, min: 120 },
] as const;

const MOOD_OPTIONS = [
  { id: null, label: "Any Vibe", icon: Sparkles },
  { id: "mind-bending", label: "Mind-Bending", icon: Brain },
  { id: "feel-good", label: "Feel-Good", icon: Smile },
  { id: "adrenaline", label: "Adrenaline", icon: Flame },
  { id: "tear-jerker", label: "Tear-Jerker", icon: HeartCrack },
] as const;

interface MoodFilterBarProps {
  onFilterChange?: () => void;
}

export function MoodFilterBar({ onFilterChange }: MoodFilterBarProps) {
  const filters = useDiscoveryStore((s) => s.filters);
  const setFilters = useDiscoveryStore((s) => s.setFilters);
  const { trigger: triggerHaptics } = useHaptics();

  return (
    <div className="w-full flex flex-col gap-2.5 my-3">
      {/* Time budget row */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5 px-1">
        <div className="flex items-center gap-1 text-2xs uppercase tracking-wider text-clay-text-muted mr-1 shrink-0 font-medium">
          <Clock className="w-3 h-3 text-accent" />
          <span>Time:</span>
        </div>
        {RUNTIME_OPTIONS.map((opt) => {
          const isSelected =
            (opt.max === null && opt.min === null && !filters.maxRuntime && !filters.minRuntime) ||
            (opt.max === filters.maxRuntime && opt.min === filters.minRuntime);

          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => {
                triggerHaptics("light");
                setFilters({ maxRuntime: opt.max, minRuntime: opt.min });
                onFilterChange?.();
              }}
              className={`
                px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition-all duration-200 border cursor-pointer
                ${
                  isSelected
                    ? "bg-accent text-white border-accent shadow-sm scale-[1.02]"
                    : "bg-clay-surface/80 hover:bg-clay-surface text-clay-text-muted hover:text-clay-text border-white/10"
                }
              `}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Mood / Vibe row */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5 px-1">
        <div className="flex items-center gap-1 text-2xs uppercase tracking-wider text-clay-text-muted mr-1 shrink-0 font-medium">
          <Sparkles className="w-3 h-3 text-accent" />
          <span>Vibe:</span>
        </div>
        {MOOD_OPTIONS.map((opt) => {
          const isSelected = (filters.mood ?? null) === opt.id;
          const Icon = opt.icon;

          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => {
                triggerHaptics("light");
                setFilters({ mood: opt.id });
                onFilterChange?.();
              }}
              className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition-all duration-200 border cursor-pointer
                ${
                  isSelected
                    ? "bg-accent/20 text-accent border-accent/40 shadow-sm scale-[1.02]"
                    : "bg-clay-surface/80 hover:bg-clay-surface text-clay-text-muted hover:text-clay-text border-white/10"
                }
              `}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
