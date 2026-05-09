/**
 * Strip HTML tags and cap length on user-provided strings before they reach
 * a search URL or backend (SECU-02). Cheap to call on every keystroke.
 */
export function sanitizeInput(input: string, maxLen = 100): string {
  return input.replace(/<[^>]*>/g, "").slice(0, maxLen);
}
