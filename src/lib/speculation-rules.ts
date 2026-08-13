// Speculation Rules API helper for sub-50ms instant speculative route transitions
// Supports native Speculation Rules in Chromium/modern browsers with safe fallback.

export function initSpeculationRules(): void {
  if (typeof document === "undefined") return;

  // Check if browser supports HTMLSpeculationRules
  if (
    typeof HTMLScriptElement !== "undefined" &&
    HTMLScriptElement.supports &&
    HTMLScriptElement.supports("speculationrules")
  ) {
    // Avoid double injection
    if (document.getElementById("wmtw-speculation-rules")) return;

    const specScript = document.createElement("script");
    specScript.id = "wmtw-speculation-rules";
    specScript.type = "speculationrules";
    specScript.textContent = JSON.stringify({
      prefetch: [
        {
          source: "list",
          urls: [
            "/discover",
            "/browse",
            "/trending",
            "/dinner-time",
            "/free-movies",
            "/what-to-watch-tonight",
          ],
          eagerness: "moderate",
        },
        {
          source: "document",
          where: {
            and: [
              { href_matches: "/*" },
              { not: { href_matches: ["/privacy", "https://*"] } },
            ],
          },
          eagerness: "moderate",
        },
      ],
    });

    document.head.appendChild(specScript);
  }
}
