// ARIA live region for dynamic content announcements (A11Y-04)

import { useState } from 'react';
import type { ReactElement } from 'react';

interface ScreenReaderAnnouncerProps {
  message: string;
}

/**
 * ScreenReaderAnnouncer — Visually hidden ARIA live region.
 *
 * Renders a visually hidden div that announces dynamic content changes
 * to screen readers via aria-live="polite". (A11Y-04)
 */
export function ScreenReaderAnnouncer({ message }: ScreenReaderAnnouncerProps) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

/**
 * useAnnounce — Companion hook for easy ScreenReaderAnnouncer usage.
 *
 * Returns [announce, AnnouncerComponent] tuple.
 * Call announce(message) to update the live region.
 *
 * @example
 * const [announce, Announcer] = useAnnounce();
 * return (
 *   <>
 *     <Announcer />
 *     <button onClick={() => announce('Movie added to watchlist')}>Love</button>
 *   </>
 * );
 */
export function useAnnounce(): [
  announce: (msg: string) => void,
  AnnouncerComponent: () => ReactElement,
] {
  const [message, setMessage] = useState('');

  function announce(msg: string) {
    // Brief clear then set forces re-announcement of same message
    setMessage('');
    setTimeout(() => setMessage(msg), 50);
  }

  function AnnouncerComponent() {
    return <ScreenReaderAnnouncer message={message} />;
  }

  return [announce, AnnouncerComponent];
}
