/**
 * useSound — Web Audio API hook for zero-latency UI sound effects.
 *
 * Lazily initializes AudioContext on first user gesture (satisfies
 * browser autoplay policy). Loads and decodes `/sounds/dial-tick.mp3`
 * once, then plays from buffer for instant playback.
 */

let audioContext: AudioContext | null = null;
let tickBuffer: AudioBuffer | null = null;
let initialized = false;
let initializing = false;

/**
 * Initialize the Web Audio pipeline. Called lazily on first user
 * interaction via a one-shot document click/touchstart listener.
 */
export async function initAudio(): Promise<void> {
  if (initialized || initializing) return;
  initializing = true;

  try {
    audioContext = new AudioContext();
    const response = await fetch('/sounds/dial-tick.mp3');
    const arrayBuffer = await response.arrayBuffer();
    tickBuffer = await audioContext.decodeAudioData(arrayBuffer);
    initialized = true;
  } catch {
    // Audio loading failed — degrade silently (no sound)
    audioContext = null;
    tickBuffer = null;
  } finally {
    initializing = false;
  }
}

// One-shot listener: initialize audio on first user gesture
if (typeof document !== 'undefined') {
  const bootstrap = () => {
    initAudio();
    document.removeEventListener('click', bootstrap);
    document.removeEventListener('touchstart', bootstrap);
  };
  document.addEventListener('click', bootstrap, { once: true });
  document.addEventListener('touchstart', bootstrap, { once: true });
}

/**
 * Play the dial tick sound. If the audio pipeline isn't ready yet,
 * silently does nothing (no error thrown).
 */
export function playTick(): void {
  if (!audioContext || !tickBuffer) return;

  // Resume context if it was suspended (e.g. tab backgrounded)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const source = audioContext.createBufferSource();
  source.buffer = tickBuffer;
  source.connect(audioContext.destination);
  source.start(0);
}
