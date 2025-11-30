"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Hook for playing combined sentence + feedback audio via real-time TTS
 *
 * This combines the sentence audio and encouragement phrase into a single
 * TTS call to avoid overlapping audio and reduce API calls.
 */
export function useCelebrateAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  /**
   * Play combined sentence + feedback phrase audio
   * @param sentence - The sentence the child completed
   * @param feedbackPhrase - Optional encouragement phrase (e.g., "Great job!")
   */
  const play = useCallback(
    async (sentence: string, feedbackPhrase?: string): Promise<void> => {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setIsPlaying(true);

      try {
        // Fetch combined audio from API
        const response = await fetch("/api/audio/celebrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sentence, feedbackPhrase }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate celebrate audio");
        }

        // Create blob URL from response
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);

        // Create and play audio
        return new Promise((resolve, reject) => {
          const audio = new Audio(audioUrl);
          audio.volume = 0.8;
          audioRef.current = audio;

          audio.onended = () => {
            setIsPlaying(false);
            URL.revokeObjectURL(audioUrl);
            resolve();
          };

          audio.onerror = () => {
            setIsPlaying(false);
            URL.revokeObjectURL(audioUrl);
            reject(new Error("Audio playback failed"));
          };

          audio.play().catch((err) => {
            setIsPlaying(false);
            URL.revokeObjectURL(audioUrl);
            reject(err);
          });
        });
      } catch (error) {
        console.error("Failed to play celebrate audio:", error);
        setIsPlaying(false);
        throw error;
      }
    },
    []
  );

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  return { play, stop, isPlaying };
}
