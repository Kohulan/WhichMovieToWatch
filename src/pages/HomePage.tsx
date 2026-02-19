// HomePage — Bento grid hero landing page.
//
// Composes 7 bento cell content components into a 12-column desktop grid using
// BentoGrid + BentoCell from the bento system. StaggerContainer wraps the grid
// so all cells fade up on scroll entry with a 0.12s stagger between cells.
//
// Drives the shared featuredStore timer: every 5s the featured movie index
// advances, causing DiscoverHeroCell, TrendingPreviewCell, and RatingShowcaseCell
// to all shuffle in sync.
//
// Layout (desktop 12-column):
// | Discover CTA (6 cols, 2 rows, glass) | Trending (3 cols, 2 rows, glass) | Rating (3 cols, 1 row, clay) |
// |                                       |                                   | Providers (3 cols, 1 row)    |
// | Dinner Time (4 cols, 1 row, clay)     | Free Movies (4 cols, 1 row, clay) | Search (4 cols, 1 row, clay) |

import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { BentoGrid, BentoCell } from '@/components/bento';
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer';
import { useTopStreaming } from '@/hooks/useTopStreaming';
import { useFeaturedStore } from '@/stores/featuredStore';

import { DiscoverHeroCell } from '@/components/bento/cells/DiscoverHeroCell';
import { TrendingPreviewCell } from '@/components/bento/cells/TrendingPreviewCell';
import { RatingShowcaseCell } from '@/components/bento/cells/RatingShowcaseCell';
import { ProviderLogosCell } from '@/components/bento/cells/ProviderLogosCell';
import { DinnerTimeCell } from '@/components/bento/cells/DinnerTimeCell';
import { FreeMoviesCell } from '@/components/bento/cells/FreeMoviesCell';
import { SearchCell } from '@/components/bento/cells/SearchCell';

const CYCLE_INTERVAL = 5000; // 5 seconds between movie changes

export function HomePage() {
  const navigate = useNavigate();
  const { movies } = useTopStreaming();
  const setTotal = useFeaturedStore((s) => s.setTotal);
  const next = useFeaturedStore((s) => s.next);

  // Sync the store total when the trending list loads or changes
  useEffect(() => {
    if (movies.length > 0) setTotal(movies.length);
  }, [movies.length, setTotal]);

  // Drive the cycling timer — advances all synced cells every 5s
  useEffect(() => {
    if (movies.length < 2) return;
    const timer = setInterval(next, CYCLE_INTERVAL);
    return () => clearInterval(timer);
  }, [movies.length, next]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Page header */}
      <div className="mb-5">
        <h1 className="font-heading text-xl font-bold text-clay-text">
          Welcome
        </h1>
        <p className="text-sm text-clay-text-muted">
          Your movie discovery hub
        </p>
      </div>

      {/* Bento grid with staggered fade-up animation on scroll entry */}
      <StaggerContainer
        stagger={0.12}
        role="region"
        aria-label="Movie discovery features"
      >
        <BentoGrid columns={12}>
          {/* Discover CTA — glass hero, 6 cols, 2 rows */}
          <StaggerItem direction="up" className="md:col-span-2 lg:col-span-6 lg:row-span-2">
            <BentoCell
              material="glass"
              colSpan={{ tablet: 2, desktop: 6 }}
              rowSpan={2}
              onClick={() => navigate('/discover')}
              overlay={
                <div className="w-full p-3 text-xs text-white/80 font-medium bg-black/30 backdrop-blur-sm">
                  Tap to explore
                </div>
              }
            >
              <DiscoverHeroCell />
            </BentoCell>
          </StaggerItem>

          {/* Trending Preview — glass, 3 cols, 2 rows */}
          <StaggerItem direction="up" className="lg:col-span-3 lg:row-span-2">
            <BentoCell
              material="glass"
              colSpan={{ desktop: 3 }}
              rowSpan={2}
              onClick={() => navigate('/trending')}
              overlay={
                <div className="w-full p-3 text-xs text-white/80 font-medium bg-black/30 backdrop-blur-sm">
                  Tap to explore
                </div>
              }
            >
              <TrendingPreviewCell />
            </BentoCell>
          </StaggerItem>

          {/* Rating Showcase — clay, 3 cols, 1 row */}
          <StaggerItem direction="up" className="lg:col-span-3">
            <BentoCell
              material="clay"
              colSpan={{ desktop: 3 }}
              onClick={() => navigate('/trending')}
            >
              <RatingShowcaseCell />
            </BentoCell>
          </StaggerItem>

          {/* Provider Logos — clay, 3 cols, 1 row, hidden on mobile */}
          <StaggerItem direction="up" className="lg:col-span-3 hidden md:block">
            <BentoCell
              material="clay"
              colSpan={{ desktop: 3 }}
              hideOnMobile={true}
            >
              <ProviderLogosCell />
            </BentoCell>
          </StaggerItem>

          {/* Dinner Time — clay, 4 cols, 1 row */}
          <StaggerItem direction="up" className="lg:col-span-4">
            <BentoCell
              material="clay"
              colSpan={{ desktop: 4 }}
              onClick={() => navigate('/dinner-time')}
              overlay={
                <div className="w-full p-3 text-xs text-clay-text-muted font-medium bg-clay-base/40 backdrop-blur-sm">
                  Tap to explore
                </div>
              }
            >
              <DinnerTimeCell />
            </BentoCell>
          </StaggerItem>

          {/* Free Movies — clay, 4 cols, 1 row */}
          <StaggerItem direction="up" className="lg:col-span-4">
            <BentoCell
              material="clay"
              colSpan={{ desktop: 4 }}
              onClick={() => navigate('/free-movies')}
              overlay={
                <div className="w-full p-3 text-xs text-clay-text-muted font-medium bg-clay-base/40 backdrop-blur-sm">
                  Tap to explore
                </div>
              }
            >
              <FreeMoviesCell />
            </BentoCell>
          </StaggerItem>

          {/* Search — clay, 4 cols, 1 row — opens search overlay */}
          <StaggerItem direction="up" className="lg:col-span-4">
            <BentoCell
              material="clay"
              colSpan={{ desktop: 4 }}
              onClick={() => window.dispatchEvent(new CustomEvent('open-search'))}
              overlay={
                <div className="w-full p-3 text-xs text-clay-text-muted font-medium bg-clay-base/40 backdrop-blur-sm">
                  Tap to search
                </div>
              }
            >
              <SearchCell />
            </BentoCell>
          </StaggerItem>
        </BentoGrid>
      </StaggerContainer>
    </div>
  );
}
