interface ClaySkeletonCardProps {
  className?: string;
  lines?: number;
  hasImage?: boolean;
}

const lineWidths = ['100%', '80%', '60%', '90%', '70%', '50%'];

/**
 * ClaySkeletonCard — Clay-styled skeleton loading placeholder with shimmer.
 *
 * Matches ClayCard dimensions and aesthetic. Internal placeholder bars
 * use the clay-shimmer animation from clay.css. Supports configurable
 * number of text lines and optional image placeholder.
 */
export function ClaySkeletonCard({
  className = '',
  lines = 3,
  hasImage = true,
}: ClaySkeletonCardProps) {
  return (
    <div
      className={`bg-clay-surface rounded-clay-lg clay-shadow-md clay-texture relative overflow-hidden transition-colors duration-300 ${className}`}
    >
      <div className="relative z-10 p-4 flex flex-col gap-3">
        {/* Image placeholder */}
        {hasImage && (
          <div
            className="w-full h-48 rounded-clay bg-clay-base overflow-hidden"
            aria-hidden="true"
          >
            <div
              className="w-full h-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, var(--clay-highlight) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'clay-shimmer 1.5s ease-in-out infinite',
              }}
            />
          </div>
        )}

        {/* Text line placeholders */}
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className="h-4 rounded-clay bg-clay-base overflow-hidden"
            style={{ width: lineWidths[i % lineWidths.length] }}
            aria-hidden="true"
          >
            <div
              className="w-full h-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, var(--clay-highlight) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: `clay-shimmer 1.5s ease-in-out infinite ${i * 0.1}s`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
