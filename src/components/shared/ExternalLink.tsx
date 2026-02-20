// Secure external link wrapper — always applies noopener noreferrer (SECU-04)

import type { AnchorHTMLAttributes, ReactNode } from "react";

interface ExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
  className?: string;
}

/**
 * ExternalLink — Secure wrapper around <a> for external URLs.
 *
 * ALWAYS sets rel="noopener noreferrer" and target="_blank" to prevent
 * tab-napping and referrer leakage (SECU-04).
 */
export function ExternalLink({
  href,
  children,
  className = "",
  ...rest
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...rest}
    >
      {children}
    </a>
  );
}
