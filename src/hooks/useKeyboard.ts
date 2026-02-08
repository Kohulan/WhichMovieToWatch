"use client";

import { useEffect } from "react";
import { useUI } from "@/stores/ui";

export function useKeyboardShortcuts() {
  const toggleCommandPalette = useUI((s) => s.toggleCommandPalette);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Cmd+K or Ctrl+K — Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleCommandPalette();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCommandPalette]);
}
