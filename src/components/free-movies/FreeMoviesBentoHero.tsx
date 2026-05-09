// FreeMoviesBentoHero — Compact bento hero for the Free Movies page (BENT-03)
//
// Compact 2-cell bento layout using BentoGrid(columns=6) placed above the
// existing FreeMoviesPageComponent. Additive — does not modify existing free movies content.
//
// Cells:
//   Cell 1 (glass, col-span 3): YouTube branding — red gradient, "Free on YouTube" heading, Film icon
//   Cell 2 (clay, col-span 3): Movie count stat — "1,000+" large number, "No subscription needed" note
//
// Wrapped in StaggerContainer for scroll-entry stagger animation.

import { Film } from "lucide-react";
import { BentoGrid } from "@/components/bento/BentoGrid";
import { BentoCell } from "@/components/bento/BentoCell";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animation/StaggerContainer";

export function FreeMoviesBentoHero() {
  return (
    <StaggerContainer stagger={0.12} className="mb-6">
      <BentoGrid columns={6}>
        {/* Cell 1 — YouTube branding: red gradient + "Free on YouTube" + Film icon */}
        <StaggerItem direction="up" className="md:col-span-2 lg:col-span-3">
          <BentoCell
            colSpan={{ tablet: 2, desktop: 3 }}
            rowSpan={1}
            material="glass"
            className="min-h-[140px]"
          >
            {/* YouTube-themed red gradient background */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-brand-youtube) 0%, color-mix(in oklch, var(--color-brand-youtube) 75%, black) 50%, color-mix(in oklch, var(--color-brand-youtube) 50%, black) 100%)",
                opacity: 0.25,
              }}
              aria-hidden="true"
            />

            <div className="relative z-10 p-5 flex flex-col justify-between h-full gap-3">
              {/* Icon + heading */}
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-youtube/20">
                  <Film
                    className="w-5 h-5 text-brand-youtube"
                    aria-hidden="true"
                  />
                </div>
                <h2 className="text-clay-text font-heading font-semibold text-base leading-tight">
                  Free on YouTube
                </h2>
              </div>

              {/* YouTube branding mark */}
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center w-7 h-5 rounded bg-brand-youtube"
                  aria-hidden="true"
                >
                  {/* YouTube play triangle */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="white"
                    className="w-3 h-3"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span className="text-clay-text-muted text-sm">
                  Full movies, no sign-in required
                </span>
              </div>
            </div>
          </BentoCell>
        </StaggerItem>

        {/* Cell 2 — Stacked trust badges (3 chips).
            Deliberately not the [big number + label + note] template; uses a
            vertical chip stack to feel structurally distinct from sibling
            heroes on Browse and Trending. */}
        <StaggerItem direction="up" className="md:col-span-2 lg:col-span-3">
          <BentoCell
            colSpan={{ tablet: 2, desktop: 3 }}
            rowSpan={1}
            material="clay"
            className="min-h-[140px]"
          >
            <div className="p-5 flex flex-col justify-center h-full gap-2.5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-clay-surface clay-shadow-sm">
                  <Film
                    className="w-4 h-4 text-accent"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-clay-text text-sm font-medium leading-tight">
                  <span className="font-heading font-bold">1,000+</span> films,
                  curated weekly
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-clay-surface clay-shadow-sm">
                  <span
                    className="text-accent text-base font-bold leading-none"
                    aria-hidden="true"
                  >
                    $
                  </span>
                </div>
                <p className="text-clay-text text-sm font-medium leading-tight">
                  No subscription, no sign-in
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-clay-surface clay-shadow-sm">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-3.5 h-3.5 text-accent"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-clay-text text-sm font-medium leading-tight">
                  Stream on YouTube, ad-supported
                </p>
              </div>
            </div>
          </BentoCell>
        </StaggerItem>
      </BentoGrid>
    </StaggerContainer>
  );
}
