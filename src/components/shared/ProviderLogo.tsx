import { motion } from "motion/react";
import { useState } from "react";
import type { ImgHTMLAttributes, SyntheticEvent } from "react";
import { getProviderLogoUrl } from "@/lib/provider-registry";

interface ProviderLogoProps {
  logoPath: string;
  size: number;
  layoutId?: string;
  className?: string;
  onError?: ImgHTMLAttributes<HTMLImageElement>["onError"];
}

/**
 * Provider logo image with consistent loading/decoding/sizing attributes.
 * alt="" because every consumer already provides a sibling text label or a
 * wrapping element with title/aria-label; named alt would make screen readers
 * announce the provider twice.
 *
 * When layoutId is supplied, renders motion.img so the logo can morph via
 * Framer Motion shared layout (see lib/layout-ids.ts).
 */
export function ProviderLogo({
  logoPath,
  size,
  layoutId,
  className,
  onError,
}: ProviderLogoProps) {
  const [failed, setFailed] = useState(false);

  // A failed logo fetch otherwise shows the browser's broken-image glyph.
  // Swap to a neutral clay tile that keeps the same footprint (no layout
  // shift) while still forwarding onError to any consumer that wants it.
  if (failed) {
    return (
      <div
        aria-hidden="true"
        style={{ width: size, height: size }}
        className={
          className ??
          "w-full h-full rounded-[inherit] bg-clay-base border border-clay-border"
        }
      />
    );
  }

  const baseProps = {
    src: getProviderLogoUrl(logoPath),
    alt: "",
    width: size,
    height: size,
    loading: "lazy" as const,
    decoding: "async" as const,
    className: className ?? "w-full h-full object-cover",
    onError: (e: SyntheticEvent<HTMLImageElement>) => {
      setFailed(true);
      onError?.(e);
    },
  };

  return layoutId ? (
    <motion.img layoutId={layoutId} {...baseProps} />
  ) : (
    <img {...baseProps} />
  );
}
