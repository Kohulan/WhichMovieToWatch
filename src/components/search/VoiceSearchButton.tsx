import { useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";

interface VoiceSearchButtonProps {
  onTranscript: (transcript: string) => void;
}

/**
 * VoiceSearchButton — Microphone button that activates Web Speech API voice search.
 *
 * Only renders if browser supports SpeechRecognition. Shows pulsing animation
 * with ring glow when actively listening. Passes transcript back to parent via
 * onTranscript callback when speech is detected.
 *
 * ARIA: aria-label="Voice search", aria-pressed for screen readers (A11Y-02)
 */
export function VoiceSearchButton({ onTranscript }: VoiceSearchButtonProps) {
  const {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
  } = useVoiceSearch();

  // Propagate transcript to parent via effect (not during render)
  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  if (!isSupported) return null;

  function handleClick() {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isListening ? "Stop voice search" : "Voice search"}
      aria-pressed={isListening}
      className={`
        relative flex items-center justify-center
        w-9 h-9 rounded-full flex-shrink-0
        transition-all duration-200
        outline-none
        focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1
        ${
          isListening
            ? "bg-accent text-white animate-pulse ring-4 ring-accent/50"
            : "text-clay-text-muted hover:text-clay-text hover:bg-clay-base/40"
        }
      `}
    >
      {isListening ? (
        <MicOff className="w-4 h-4" aria-hidden="true" />
      ) : (
        <Mic className="w-4 h-4" aria-hidden="true" />
      )}
    </button>
  );
}
