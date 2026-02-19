import { useState, useEffect, useRef } from 'react';
import { Smartphone } from 'lucide-react';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

const LS_KEY_DISMISSED = 'wmtw-gyro-dismissed';
const AUTO_DISMISS_MS = 8000;

/**
 * GyroscopeProvider — Permission prompt UI and gyroscope enablement for mobile.
 *
 * IMPORTANT: This component is always rendered INSIDE SplineScene, which itself
 * is only mounted on full-3d and reduced-3d capable devices. Therefore:
 *   - Fallback-2d devices NEVER mount SplineScene → NEVER mount GyroscopeProvider
 *   - The gyroscope prompt only appears when the 3D scene is actually rendering
 *
 * Prompt behavior:
 *   - Only shown on touch devices (navigator.maxTouchPoints > 0)
 *   - Only shown when permissionState === 'prompt' (iOS 13+)
 *   - Auto-dismisses after 8 seconds
 *   - Manual dismiss caches to localStorage (wmtw-gyro-dismissed) — won't re-appear
 *   - Dismiss resets if the user clears localStorage
 *
 * Visual design:
 *   - Floating card in bottom-right corner, above TabBar (~80px from bottom)
 *   - Clay-styled (claymorphism) for consistency with the design system
 *   - Smartphone icon from lucide-react
 *   - "Enable immersive tilt" call-to-action
 *   - X dismiss button in corner
 *
 * After permission is granted, this component renders nothing —
 * orientation data flows through the useDeviceOrientation hook to SplineScene.
 */
export function GyroscopeProvider() {
  const { permissionState, requestPermission } = useDeviceOrientation();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LS_KEY_DISMISSED) === '1';
    } catch {
      return false;
    }
  });
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect touch device once (ref avoids re-renders)
  const isMobileRef = useRef(
    typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0,
  );

  useEffect(() => {
    // Only show the prompt on mobile touch devices with iOS-style permission
    if (!isMobileRef.current) return;
    if (dismissed) return;
    if (permissionState !== 'prompt') return;

    setVisible(true);

    // Auto-dismiss after 8 seconds
    timerRef.current = setTimeout(() => {
      setVisible(false);
    }, AUTO_DISMISS_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [permissionState, dismissed]);

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
    setDismissed(true);
    try {
      localStorage.setItem(LS_KEY_DISMISSED, '1');
    } catch {
      // localStorage may be unavailable in private browsing — non-fatal
    }
  };

  const handleEnable = async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
    await requestPermission();
  };

  // Don't render when:
  // - not visible (dismissed or not yet triggered)
  // - already granted (no need for prompt)
  // - denied or unsupported
  if (!visible || permissionState !== 'prompt') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '88px', // above TabBar (~72px) + margin
        right: '16px',
        zIndex: 200,
        // Clay card styles (inline to avoid Tailwind purge issues in dynamic component)
        background: 'color-mix(in oklch, var(--clay-base) 95%, transparent)',
        borderRadius: '16px',
        padding: '14px 16px',
        boxShadow:
          '0 8px 24px -4px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)',
        border: '1px solid color-mix(in oklch, var(--clay-border) 60%, transparent)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        maxWidth: '220px',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        // Pointer events enabled — this is an interactive prompt, not decorative
        pointerEvents: 'auto',
        // Subtle entry animation via CSS
        animation: 'gyro-prompt-slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }}
      role="dialog"
      aria-label="Enable gyroscope for immersive tilt"
    >
      <style>{`
        @keyframes gyro-prompt-slide-in {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>

      {/* Smartphone icon */}
      <div
        style={{
          flexShrink: 0,
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'color-mix(in oklch, var(--accent) 15%, transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Smartphone
          size={18}
          style={{ color: 'var(--accent)' }}
          aria-hidden="true"
        />
      </div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <button
          onClick={handleEnable}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            textAlign: 'left',
            display: 'block',
            width: '100%',
          }}
          aria-label="Enable immersive tilt — tap to grant gyroscope access"
        >
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--foreground)',
              lineHeight: 1.3,
              marginBottom: '2px',
            }}
          >
            Immersive tilt
          </div>
          <div
            style={{
              fontSize: '11px',
              color: 'color-mix(in oklch, var(--foreground) 60%, transparent)',
              lineHeight: 1.3,
            }}
          >
            Tilt your phone to explore the scene
          </div>
        </button>
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        style={{
          flexShrink: 0,
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: 'color-mix(in oklch, var(--foreground) 10%, transparent)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          lineHeight: 1,
          color: 'color-mix(in oklch, var(--foreground) 60%, transparent)',
          padding: 0,
          alignSelf: 'flex-start',
        }}
        aria-label="Dismiss gyroscope prompt"
      >
        ×
      </button>
    </div>
  );
}

export default GyroscopeProvider;
