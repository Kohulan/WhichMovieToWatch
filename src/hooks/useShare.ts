/**
 * useShare.ts
 * Web Share API hook with native share detection and clipboard fallback.
 */

export function useShare() {
  const canNativeShare: boolean =
    typeof navigator !== "undefined" && !!navigator.share;

  /**
   * Attempt navigator.share(). Returns true on success, false if cancelled or unavailable.
   */
  async function share(data: {
    title: string;
    text: string;
    url: string;
  }): Promise<boolean> {
    if (!canNativeShare) return false;
    try {
      await navigator.share(data);
      return true;
    } catch (err) {
      // AbortError = user cancelled — treat as non-error
      if (err instanceof Error && err.name === "AbortError") {
        return false;
      }
      console.warn("[useShare] navigator.share failed:", err);
      return false;
    }
  }

  /**
   * Copy text to clipboard. Returns true on success, false on error.
   */
  async function copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("[useShare] clipboard.writeText failed:", err);
      return false;
    }
  }

  return { canNativeShare, share, copyToClipboard };
}
