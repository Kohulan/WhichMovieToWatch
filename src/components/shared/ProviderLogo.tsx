import { motion } from "motion/react";
import type { ImgHTMLAttributes } from "react";
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
  const baseProps = {
    src: getProviderLogoUrl(logoPath),
    alt: "",
    width: size,
    height: size,
    loading: "lazy" as const,
    decoding: "async" as const,
    className: className ?? "w-full h-full object-cover",
    onError,
  };

  return layoutId ? (
    <motion.img layoutId={layoutId} {...baseProps} />
  ) : (
    <img {...baseProps} />
  );
}
