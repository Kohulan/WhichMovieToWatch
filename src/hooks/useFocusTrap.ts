import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * useFocusTrap — Trap Tab focus within a container while active, and restore
 * focus to the previously-focused element on deactivation.
 *
 * Attach the returned ref to the dialog/drawer root. Container must contain at
 * least one focusable child.
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const containerRef = useRef<T>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const container = containerRef.current;
    if (!container) return;

    const focusables = container.querySelectorAll<HTMLElement>(
      FOCUSABLE_SELECTOR,
    );
    if (focusables.length > 0) {
      // Defer one frame so any sibling autoFocus effect can run first.
      // Only steal focus if nothing inside the container has it yet.
      requestAnimationFrame(() => {
        if (!container.contains(document.activeElement)) {
          focusables[0]?.focus();
        }
      });
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab" || !container) return;
      const list = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      const current = document.activeElement;

      if (e.shiftKey) {
        if (current === first || !container.contains(current)) {
          e.preventDefault();
          last.focus();
        }
      } else if (current === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const prev = previouslyFocusedRef.current;
      if (prev && document.body.contains(prev)) {
        requestAnimationFrame(() => prev.focus());
      }
    };
  }, [active]);

  return containerRef;
}
