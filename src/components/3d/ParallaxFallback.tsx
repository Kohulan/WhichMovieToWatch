import { useEffect, useRef } from "react";
import { useMotionValue, useTransform, useSpring, motion } from "motion/react";

interface ParallaxFallbackProps {
  className?: string;
}

/**
 * ParallaxFallback — 2D CSS perspective parallax background for low-end devices.
 *
 * Rendered when GPU tier is 0-1, WebGL is unavailable, or user has
 * prefers-reduced-motion enabled. Provides a cinematic depth illusion
 * using CSS perspective + translateZ layers without GPU-intensive 3D rendering.
 *
 * Layer architecture (deepest to closest):
 *   Layer 1 (z=-200px): Deep ambient gradient circle (accent color, 0.06 opacity)
 *   Layer 2 (z=-120px): Film reel silhouette SVG with slow spin
 *   Layer 3 (z=-60px):  Spotlight beam radial gradient sweep
 *   Layer 4 (z=-20px):  Floating dust particles drifting upward
 *
 * Mouse tracking uses Framer Motion useMotionValue + useSpring to apply
 * subtle rotateX/rotateY (max 3-4 degrees) to the perspective container,
 * creating a parallax depth feel. Desktop only — skipped on touch devices.
 *
 * Colors use CSS variables (--accent, --clay-base) for automatic theme adaptation.
 */
export function ParallaxFallback({ className = "" }: ParallaxFallbackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isTouchDevice = useRef(
    typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0),
  );

  // Raw mouse position normalized to -1..1 range
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);

  // Spring-smoothed rotation for parallax feel
  const rotateX = useSpring(rawRotateX, { stiffness: 50, damping: 20 });
  const rotateY = useSpring(rawRotateY, { stiffness: 50, damping: 20 });

  // Map to max ±3 degrees of tilt
  const tiltX = useTransform(rotateX, [-1, 1], [3, -3]);
  const tiltY = useTransform(rotateY, [-1, 1], [-4, 4]);

  useEffect(() => {
    if (isTouchDevice.current) return;

    function handleMouseMove(e: MouseEvent) {
      const { innerWidth: w, innerHeight: h } = window;
      // Normalize to -1..1
      rawRotateX.set((e.clientY / h - 0.5) * 2);
      rawRotateY.set((e.clientX / w - 0.5) * 2);
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [rawRotateX, rawRotateY]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
      style={{
        // contain:layout paint isolates this decorative layer from the main document
        // layout flow, preventing repaints in the 3D container from triggering full
        // page layout recalculations. Improves Lighthouse CLS and rendering performance.
        contain: "layout paint",
      }}
    >
      {/* Perspective container with mouse-responsive tilt */}
      <motion.div
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
          width: "100%",
          height: "100%",
          rotateX: tiltX,
          rotateY: tiltY,
          // will-change:transform promotes this div to its own GPU compositor layer.
          // The continuous spring-animated rotateX/rotateY are compositor-thread
          // animations (transform only), so this hint enables zero-jank parallax.
          willChange: "transform",
        }}
      >
        {/* Layer 1 — deepest: large ambient gradient circle (accent color) */}
        <div
          style={{
            transform: "translateZ(-200px)",
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // Compositor-thread transform (translateZ) — no layout triggers
            willChange: "transform",
          }}
        >
          <div
            style={{
              width: "80%",
              height: "80%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, color-mix(in oklch, var(--accent) 60%, transparent) 0%, transparent 70%)",
              opacity: 0.03,
              filter: "blur(80px)",
            }}
          />
        </div>

        {/* Layer 2 — film reel silhouette SVG with slow rotation */}
        <div
          style={{
            transform: "translateZ(-120px)",
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            willChange: "transform",
          }}
        >
          {/* Film reel SVG: outer circle + 6 rectangular sprocket holes + inner hub */}
          <svg
            width="240"
            height="240"
            viewBox="0 0 100 100"
            className="film-reel-spin"
            style={{
              opacity: 0.03,
              color: "var(--accent)",
              animationDuration: "30s",
            }}
            fill="currentColor"
          >
            {/* Outer ring */}
            <circle
              cx="50"
              cy="50"
              r="48"
              fillOpacity="0"
              stroke="currentColor"
              strokeWidth="2"
            />
            {/* Inner hub circle */}
            <circle cx="50" cy="50" r="12" />
            {/* Center hole */}
            <circle cx="50" cy="50" r="5" fill="var(--clay-base)" />
            {/* 6 sprocket holes evenly distributed */}
            {[0, 60, 120, 180, 240, 300].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const cx = 50 + 32 * Math.cos(rad);
              const cy = 50 + 32 * Math.sin(rad);
              return <circle key={deg} cx={cx} cy={cy} r="6" />;
            })}
          </svg>
        </div>

        {/* Layer 3 — spotlight beam radial gradient */}
        <div
          style={{
            transform: "translateZ(-60px)",
            position: "absolute",
            inset: 0,
            willChange: "transform",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-10%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "60%",
              height: "80%",
              background:
                "radial-gradient(ellipse at 50% 0%, color-mix(in oklch, var(--accent) 30%, transparent) 0%, transparent 65%)",
              opacity: 0.04,
              filter: "blur(30px)",
            }}
          />
        </div>

        {/* Layer 4 — floating dust particles (closest layer) */}
        <div
          style={{
            transform: "translateZ(-20px)",
            position: "absolute",
            inset: 0,
            willChange: "transform",
          }}
        >
          {DUST_PARTICLES.map((p) => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: `${p.x}%`,
                bottom: `${p.startY}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                borderRadius: "50%",
                background: "var(--accent)",
                opacity: p.opacity,
                animation: `parallax-dust-drift ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Dust particle keyframes — injected inline to avoid separate CSS file */}
      <style>{`
        @keyframes parallax-dust-drift {
          0%   { transform: translateY(0px) translateX(0px); opacity: inherit; }
          50%  { transform: translateY(-40px) translateX(8px); }
          100% { transform: translateY(-80px) translateX(-4px); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .film-reel-spin { animation: none; }
        }
      `}</style>
    </div>
  );
}

// Static dust particle definitions for 8 particles
// Defined outside component to avoid recreation on every render
const DUST_PARTICLES = [
  { id: 1, x: 15, startY: 10, size: 2, opacity: 0.3, duration: 8, delay: 0 },
  { id: 2, x: 30, startY: 25, size: 1.5, opacity: 0.2, duration: 12, delay: 2 },
  { id: 3, x: 50, startY: 5, size: 3, opacity: 0.25, duration: 10, delay: 1 },
  { id: 4, x: 65, startY: 40, size: 1, opacity: 0.15, duration: 15, delay: 3 },
  {
    id: 5,
    x: 80,
    startY: 15,
    size: 2.5,
    opacity: 0.2,
    duration: 9,
    delay: 0.5,
  },
  {
    id: 6,
    x: 20,
    startY: 60,
    size: 1.5,
    opacity: 0.18,
    duration: 11,
    delay: 4,
  },
  {
    id: 7,
    x: 45,
    startY: 70,
    size: 2,
    opacity: 0.22,
    duration: 13,
    delay: 1.5,
  },
  {
    id: 8,
    x: 70,
    startY: 50,
    size: 1,
    opacity: 0.12,
    duration: 16,
    delay: 2.5,
  },
];
