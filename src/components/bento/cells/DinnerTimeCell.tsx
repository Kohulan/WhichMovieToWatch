// DinnerTimeCell — Feature CTA for Dinner Time section.
//
// Designed as col-span-4, row-span-1 on desktop.
// Clay material cell. Click navigates to /dinner-time.

import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { UtensilsCrossed, ArrowRight } from 'lucide-react';

export function DinnerTimeCell() {
  const navigate = useNavigate();

  return (
    <div
      className="w-full h-full flex items-center gap-4 p-4"
      onClick={() => navigate('/dinner-time')}
    >
      {/* Icon with gentle wobble */}
      <motion.div
        className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center"
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
      >
        <UtensilsCrossed className="w-6 h-6 text-accent" aria-hidden="true" />
      </motion.div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-heading text-base font-semibold text-clay-text leading-tight">
          Dinner Time
        </h3>
        <p className="text-xs text-clay-text-muted mt-0.5 leading-snug">
          Family-friendly movies for movie night
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
