// Web Speech API voice search hook with feature detection and cleanup

import { useState, useRef, useCallback, useEffect } from "react";

// SpeechRecognition types — not available in all TypeScript lib configs
// Declare minimal interface here to avoid needing @types/dom-speech-recognition
interface ISpeechRecognitionResult {
  readonly [index: number]: ISpeechRecognitionAlternative;
  readonly length: number;
  readonly isFinal: boolean;
}
interface ISpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface ISpeechRecognitionResultList {
  readonly [index: number]: ISpeechRecognitionResult;
  readonly length: number;
}
interface ISpeechRecognitionEvent extends Event {
  readonly results: ISpeechRecognitionResultList;
}
interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

// Extend Window to include both standard and webkit-prefixed SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: ISpeechRecognitionConstructor;
    webkitSpeechRecognition?: ISpeechRecognitionConstructor;
  }
}

interface UseVoiceSearchReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
}

/**
 * useVoiceSearch — Web Speech API integration with feature detection.
 *
 * Detects browser support for SpeechRecognition (or webkit-prefixed fallback).
 * Exposes isListening state and transcript string that updates as user speaks.
 * Automatically stops on recognition end or error.
 * Cleans up recognition instance on component unmount.
 *
 * @example
 * const { isSupported, isListening, transcript, startListening, stopListening } = useVoiceSearch();
 * // Show mic button only if isSupported
 * // Use transcript to populate search input
 */
export function useVoiceSearch(): UseVoiceSearchReturn {
  const isSupported =
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      const result = event.results[0];
      if (result) {
        const alternative = result[0];
        if (alternative) {
          setTranscript(alternative.transcript);
        }
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported]);

  return {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
  };
}
