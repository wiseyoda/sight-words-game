"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useAudioSettings } from "./AudioContext";

type AudioStyle = "celebrate" | "encourage" | "guide";

/**
 * Hook for playing TTS audio for UI text announcements.
 * Used for mission intros, mission complete screens, and other
 * text that children cannot read.
 */
export function useUITextAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { getEffectiveVolume } = useAudioSettings();

  /**
   * Play TTS audio for the given text
   */
  const play = useCallback(
    async (text: string, style: AudioStyle = "guide"): Promise<void> => {
      const volume = getEffectiveVolume("voice");
      if (volume === 0) {
        // Skip if muted
        return;
      }

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setIsPlaying(true);

      try {
        // Fetch audio from API
        const response = await fetch("/api/audio/ui-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, style }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate UI text audio");
        }

        // Create blob URL from response
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);

        // Create and play audio
        const audio = new Audio(audioUrl);
        audio.volume = volume;
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
        console.error("Failed to play UI text audio:", error);
        setIsPlaying(false);
      }
    },
    [getEffectiveVolume]
  );

  /**
   * Stop any currently playing audio
   */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  return { play, stop, isPlaying };
}

/**
 * Hook that automatically plays TTS audio when text changes.
 * Ideal for announcing UI text on component mount.
 *
 * @param text - The text to speak
 * @param style - The speaking style
 * @param delay - Delay in ms before playing (default: 500ms for mount animations)
 * @param enabled - Whether to play (useful for conditional playback)
 */
export function useAutoPlayUIText(
  text: string | undefined,
  style: AudioStyle = "guide",
  delay: number = 500,
  enabled: boolean = true
) {
  const { play, stop, isPlaying } = useUITextAudio();
  const hasPlayedRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip if disabled, no text, or already played this text
    if (!enabled || !text || hasPlayedRef.current === text) {
      return;
    }

    const timeoutId = setTimeout(() => {
      hasPlayedRef.current = text;
      play(text, style);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      stop();
    };
  }, [text, style, delay, enabled, play, stop]);

  return { isPlaying };
}
