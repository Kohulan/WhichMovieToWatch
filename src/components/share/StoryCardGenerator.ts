/**
 * StoryCardGenerator.ts
 * Canvas-based Instagram story card generator (1080x1920).
 * Theme-aware: gradient and accent colors match the current theme preset.
 * Poster loaded via corsproxy.io CORS proxy to bypass TMDB CORS restrictions.
 */

import type { ColorPreset } from "@/stores/themeStore";

export interface StoryCardMovie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  genres?: Array<{ id: number; name: string }>;
}

/** Gradient pairs (start, end) per preset and mode */
const THEME_GRADIENTS: Record<
  ColorPreset,
  { dark: [string, string]; light: [string, string] }
> = {
  "warm-orange": {
    dark: ["#1f150d", "#2d1810"],
    light: ["#f5e6d3", "#f0d4b8"],
  },
  gold: {
    dark: ["#1c1508", "#2a1f0d"],
    light: ["#f5ecd3", "#ede0b8"],
  },
  "clean-white": {
    dark: ["#0f1118", "#161a24"],
    light: ["#f0f2f5", "#e4e8ee"],
  },
};

/** Accent colors per preset */
const THEME_ACCENTS: Record<ColorPreset, { dark: string; light: string }> = {
  "warm-orange": { dark: "#ff8c42", light: "#c05a10" },
  gold: { dark: "#d4a017", light: "#9a7200" },
  "clean-white": { dark: "#6b9bd2", light: "#2e5fa3" },
};

/** Text colors per mode */
const TEXT_COLORS = {
  dark: { primary: "#ffffff", secondary: "rgba(255,255,255,0.6)" },
  light: { primary: "#1a1a1a", secondary: "rgba(0,0,0,0.55)" },
};

function loadImageFromSrc(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Generate a 1080x1920 story card PNG blob for the given movie and theme.
 * Returns null if canvas is unavailable (e.g., SSR).
 */
export async function generateStoryCard(
  movie: StoryCardMovie,
  preset: ColorPreset,
  mode: "light" | "dark",
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const CARD_W = 1080;
  const CARD_H = 1920;
  const gradientColors = THEME_GRADIENTS[preset][mode];
  const accentColor = THEME_ACCENTS[preset][mode];
  const textColors = TEXT_COLORS[mode];

  // --- Background gradient ---
  const bg = ctx.createLinearGradient(0, 0, 0, CARD_H);
  bg.addColorStop(0, gradientColors[0]);
  bg.addColorStop(1, gradientColors[1]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // --- Star pattern overlay (subtle dots) ---
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * CARD_W;
    const y = Math.random() * CARD_H;
    const size = Math.random() * 3 + 1;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // --- Poster ---
  const POSTER_W = 800;
  const POSTER_H = 1200;
  const POSTER_X = (CARD_W - POSTER_W) / 2; // 140
  const POSTER_Y = 80;

  // Shadow before clip
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 20;

  let posterLoaded = false;

  if (movie.poster_path) {
    const tmdbUrl = `https://image.tmdb.org/t/p/w780${movie.poster_path}`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(tmdbUrl)}`;
    try {
      const img = await loadImageFromSrc(proxyUrl);
      ctx.save();
      drawRoundedRect(ctx, POSTER_X, POSTER_Y, POSTER_W, POSTER_H, 20);
      ctx.clip();
      ctx.shadowColor = "transparent"; // clip resets after save/restore
      ctx.drawImage(img, POSTER_X, POSTER_Y, POSTER_W, POSTER_H);
      ctx.restore();
      posterLoaded = true;
    } catch {
      // Fallback handled below
    }
  }

  if (!posterLoaded) {
    // Gradient placeholder poster
    ctx.save();
    drawRoundedRect(ctx, POSTER_X, POSTER_Y, POSTER_W, POSTER_H, 20);
    const placeholderGrad = ctx.createLinearGradient(
      POSTER_X,
      POSTER_Y,
      POSTER_X + POSTER_W,
      POSTER_Y + POSTER_H,
    );
    placeholderGrad.addColorStop(0, mode === "dark" ? "#2d3561" : "#c8d6e8");
    placeholderGrad.addColorStop(1, mode === "dark" ? "#0f3460" : "#8faac6");
    ctx.fillStyle = placeholderGrad;
    ctx.fill();
    ctx.restore();

    // Title text over placeholder
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.font = "bold 60px Arial, sans-serif";
    ctx.fillStyle = mode === "dark" ? "#ffffff" : "#1a1a1a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Simple word-wrap for title
    const words = movie.title.split(" ");
    let line = "";
    const lines: string[] = [];
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > POSTER_W - 80) {
        if (line) lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    const lineH = 70;
    const startY = POSTER_Y + POSTER_H / 2 - ((lines.length - 1) * lineH) / 2;
    lines.forEach((l, i) => {
      ctx.fillText(l, CARD_W / 2, startY + i * lineH);
    });
  }

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // --- Info row (year + rating) ---
  const INFO_Y = POSTER_Y + POSTER_H + 60;
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear().toString()
    : "";
  const ratingStr = movie.vote_average
    ? `★ ${movie.vote_average.toFixed(1)}`
    : "";
  const infoText = [year, ratingStr].filter(Boolean).join("  -  ");

  ctx.font = "48px Arial, sans-serif";
  ctx.fillStyle = textColors.secondary;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(infoText, CARD_W / 2, INFO_Y);

  // --- Genres ---
  if (movie.genres && movie.genres.length > 0) {
    const genreText = movie.genres
      .slice(0, 3)
      .map((g) => g.name)
      .join(" • ");
    ctx.font = "38px Arial, sans-serif";
    ctx.fillStyle = textColors.secondary;
    ctx.textAlign = "center";
    ctx.fillText(genreText, CARD_W / 2, INFO_Y + 75);
  }

  // --- Bottom branding ---
  const LINK_Y = CARD_H - 160;

  // Site URL in accent color
  ctx.font = "34px Arial, sans-serif";
  ctx.fillStyle = accentColor;
  ctx.textAlign = "center";
  ctx.fillText("whichmovietowatch.online", CARD_W / 2, LINK_Y);

  // Brand name
  ctx.font = "bold 44px Arial, sans-serif";
  ctx.fillStyle = textColors.primary;
  ctx.fillText("Which Movie To Watch", CARD_W / 2, LINK_Y + 60);

  // Tagline
  ctx.font = "30px Arial, sans-serif";
  ctx.fillStyle = textColors.secondary;
  ctx.fillText("Discover • Share • Enjoy", CARD_W / 2, LINK_Y + 105);

  // Return as Blob via Promise wrapper
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

/**
 * Generate a 1080x1080 post card PNG blob for the given movie and theme.
 * Square format optimised for Instagram/Facebook feed posts.
 */
export async function generatePostCard(
  movie: StoryCardMovie,
  preset: ColorPreset,
  mode: "light" | "dark",
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const W = 1080;
  const H = 1080;
  const gradientColors = THEME_GRADIENTS[preset][mode];
  const accentColor = THEME_ACCENTS[preset][mode];
  const textColors = TEXT_COLORS[mode];

  // --- Background gradient ---
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, gradientColors[0]);
  bg.addColorStop(1, gradientColors[1]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // --- Subtle dot overlay ---
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const size = Math.random() * 3 + 1;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // --- Poster (left side) ---
  const POSTER_W = 420;
  const POSTER_H = 630;
  const POSTER_X = 60;
  const POSTER_Y = (H - POSTER_H) / 2 - 30;

  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;

  let posterLoaded = false;
  if (movie.poster_path) {
    const tmdbUrl = `https://image.tmdb.org/t/p/w780${movie.poster_path}`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(tmdbUrl)}`;
    try {
      const img = await loadImageFromSrc(proxyUrl);
      ctx.save();
      drawRoundedRect(ctx, POSTER_X, POSTER_Y, POSTER_W, POSTER_H, 16);
      ctx.clip();
      ctx.shadowColor = "transparent";
      ctx.drawImage(img, POSTER_X, POSTER_Y, POSTER_W, POSTER_H);
      ctx.restore();
      posterLoaded = true;
    } catch {
      // fallback below
    }
  }

  if (!posterLoaded) {
    ctx.save();
    drawRoundedRect(ctx, POSTER_X, POSTER_Y, POSTER_W, POSTER_H, 16);
    const pg = ctx.createLinearGradient(
      POSTER_X,
      POSTER_Y,
      POSTER_X + POSTER_W,
      POSTER_Y + POSTER_H,
    );
    pg.addColorStop(0, mode === "dark" ? "#2d3561" : "#c8d6e8");
    pg.addColorStop(1, mode === "dark" ? "#0f3460" : "#8faac6");
    ctx.fillStyle = pg;
    ctx.fill();
    ctx.restore();
  }

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // --- Right-side info ---
  const TEXT_X = POSTER_X + POSTER_W + 50;
  const TEXT_MAX_W = W - TEXT_X - 60;

  // Title (word-wrapped)
  ctx.font = "bold 52px Arial, sans-serif";
  ctx.fillStyle = textColors.primary;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  const words = movie.title.split(" ");
  let line = "";
  const lines: string[] = [];
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > TEXT_MAX_W) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  let ty = POSTER_Y + 40;
  for (const l of lines) {
    ctx.fillText(l, TEXT_X, ty);
    ty += 62;
  }
  ty += 10;

  // Year + rating
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear().toString()
    : "";
  const rating = movie.vote_average ? `★ ${movie.vote_average.toFixed(1)}` : "";
  const infoText = [year, rating].filter(Boolean).join("  ·  ");
  ctx.font = "38px Arial, sans-serif";
  ctx.fillStyle = textColors.secondary;
  ctx.fillText(infoText, TEXT_X, ty);
  ty += 55;

  // Genres
  if (movie.genres && movie.genres.length > 0) {
    const genreText = movie.genres
      .slice(0, 3)
      .map((g) => g.name)
      .join(" • ");
    ctx.font = "32px Arial, sans-serif";
    ctx.fillStyle = textColors.secondary;
    ctx.fillText(genreText, TEXT_X, ty);
  }

  // --- Bottom branding ---
  ctx.font = "30px Arial, sans-serif";
  ctx.fillStyle = accentColor;
  ctx.textAlign = "center";
  ctx.fillText("whichmovietowatch.online", W / 2, H - 70);

  ctx.font = "bold 36px Arial, sans-serif";
  ctx.fillStyle = textColors.primary;
  ctx.fillText("Which Movie To Watch", W / 2, H - 30);

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

/**
 * Trigger a download of the story card blob as a PNG file.
 */
export function downloadStoryCard(blob: Blob, movieTitle: string): void {
  const filename = `${movieTitle.replace(/\s+/g, "-").toLowerCase()}-story.png`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Tiered image share: native file share → clipboard copy → download.
 * Returns a user-facing status message.
 */
export async function shareImageBlob(
  blob: Blob,
  movieTitle: string,
  filename: string,
): Promise<"shared" | "copied" | "downloaded"> {
  const file = new File([blob], filename, {
    type: "image/png",
    lastModified: Date.now(),
  });

  // 1. Try native share with file (works on mobile)
  if (navigator.share && navigator.canShare) {
    const shareData = { files: [file] };
    if (navigator.canShare(shareData)) {
      try {
        await navigator.share({
          ...shareData,
          title: movieTitle,
          text: `Check out "${movieTitle}" — whichmovietowatch.online`,
        });
        return "shared";
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return "shared";
        // fall through to clipboard
      }
    }
  }

  // 2. Try clipboard copy
  try {
    if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
      const item = new ClipboardItem({ "image/png": blob });
      await navigator.clipboard.write([item]);
      return "copied";
    }
  } catch {
    // fall through to download
  }

  // 3. Fallback: download
  downloadStoryCard(blob, movieTitle);
  return "downloaded";
}
