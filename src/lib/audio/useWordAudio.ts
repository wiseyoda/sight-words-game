"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Simple hook for playing word audio
 * Creates a new Audio element each time to avoid caching issues
 * Includes automatic retry on failure
 */
export function useWordAudio(word: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryCountRef = useRef(0);
  const [isLoading, setIsLoading] = useState(false);

  const play = useCallback(() => {
    // Skip punctuation
    if (/^[.!?]$/.test(word)) return;

    const audioUrl = `/api/audio/${encodeURIComponent(word.toLowerCase())}`;

    // Stop any currently playing audio for this word
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsLoading(true);

    // Create new audio element and play
    const audio = new Audio(audioUrl);
    audio.volume = 0.8;
    audio.preload = "auto";
    audioRef.current = audio;

    // Handle successful load
    audio.oncanplaythrough = () => {
      setIsLoading(false);
      retryCountRef.current = 0;
    };

    audio.onended = () => {
      setIsLoading(false);
    };

    // Handle errors with retry
    audio.onerror = () => {
      setIsLoading(false);
      if (retryCountRef.current < 2) {
        retryCountRef.current++;
        console.log(`Retrying audio for "${word}" (attempt ${retryCountRef.current + 1})`);
        // Retry after a short delay
        setTimeout(() => {
          const retryAudio = new Audio(audioUrl + `?retry=${Date.now()}`);
          retryAudio.volume = 0.8;
          audioRef.current = retryAudio;
          retryAudio.play().catch(() => {
            console.error(`Failed to play audio for "${word}" after retry`);
          });
        }, 500);
      } else {
        console.error(`Failed to play audio for "${word}" after ${retryCountRef.current + 1} attempts`);
      }
    };

    audio.play().catch((error) => {
      console.error(`Failed to play audio for "${word}":`, error);
      setIsLoading(false);
    });
  }, [word]);

  return { play, isLoading };
}
