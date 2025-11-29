"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Hook for playing sentence audio via real-time TTS
 */
export function useSentenceAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback(async (sentence: string): Promise<void> => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsPlaying(true);

    try {
      // Fetch audio from API
      const response = await fetch("/api/audio/sentence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate sentence audio");
      }

      // Create blob URL from response
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);

      // Create and play audio
      const audio = new Audio(audioUrl);
      audio.volume = 0.8;
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error("Failed to play sentence audio:", error);
      setIsPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  return { play, stop, isPlaying };
}
