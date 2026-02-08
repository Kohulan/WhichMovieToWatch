"use client";

import { motion } from "motion/react";

interface RatingRingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
}

export function RatingRing({
  rating,
  maxRating = 10,
  size = 56,
  strokeWidth = 4,
  label,
  color,
}: RatingRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = (rating / maxRating) * 100;
  const offset = circumference - (percentage / 100) * circumference;

  const ratingColor =
    color || (rating >= 7 ? "#2DD4BF" : rating >= 5 ? "#F97316" : "#FB7185");

  return (
    <div className="flex items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ratingColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-xs font-bold"
          style={{ color: ratingColor }}
        >
          {rating.toFixed(1)}
        </span>
      </div>
      {label && (
        <span className="text-xs text-[var(--text-muted)]">{label}</span>
      )}
    </div>
  );
}
