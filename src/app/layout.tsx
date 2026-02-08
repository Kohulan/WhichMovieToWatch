import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { Navbar } from "@/components/layout/Navbar";
import { CommandPalette } from "@/components/search/CommandPalette";
import { MovieDetailModal } from "@/components/movie/MovieDetailModal";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Which Movie To Watch — Find Your Next Favorite Film",
    template: "%s | Which Movie To Watch",
  },
  description:
    "Discover your next favorite movie with personalized recommendations. Swipe, search, and explore movies across all major streaming platforms.",
  keywords: [
    "movie recommendations",
    "what to watch",
    "movie finder",
    "streaming movies",
    "movie suggestions",
    "Netflix",
    "Disney Plus",
    "movie discovery",
  ],
  authors: [{ name: "Kohulan.R", url: "https://kohulanr.com" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.whichmovieto.watch",
    title: "Which Movie To Watch — Find Your Next Favorite Film",
    description:
      "Discover your next favorite movie with personalized recommendations. Swipe, search, and explore.",
    siteName: "Which Movie To Watch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Which Movie To Watch — Find Your Next Favorite Film",
    description:
      "Discover your next favorite movie with personalized recommendations.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#09090B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="antialiased" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
        <QueryProvider>
          <MotionProvider>
            {/* Aurora ambient background */}
            <div className="aurora-bg" aria-hidden="true" />

            {/* Navigation */}
            <Navbar />

            {/* Command Palette */}
            <CommandPalette />

            {/* Movie Detail Modal */}
            <MovieDetailModal />

            {/* Main content */}
            <main className="relative z-0 min-h-screen">
              {children}
            </main>

            {/* Toast notifications */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "var(--bg-clay)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-clay)",
                  borderRadius: "var(--clay-radius-sm)",
                  boxShadow: "var(--clay-shadow-sm)",
                },
              }}
            />
          </MotionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
