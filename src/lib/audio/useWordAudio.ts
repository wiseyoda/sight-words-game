"use client";

import { useCallback, useRef } from "react";

/**
 * Simple hook for playing word audio
 * Creates a new Audio element each time to avoid caching issues
 */
export function useWordAudio(word: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    // Skip punctuation
    if (/^[.!?]$/.test(word)) return;

    const audioUrl = `/api/audio/${encodeURIComponent(word.toLowerCase())}`;

    // Stop any currently playing audio for this word
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Create new audio element and play
    const audio = new Audio(audioUrl);
    audio.volume = 0.8;
    audioRef.current = audio;

    audio.play().catch((error) => {
      console.error(`Failed to play audio for "${word}":`, error);
    });
  }, [word]);

  return { play };
}
