"use client";

import { useCallback, useRef } from "react";
import { useTheme } from "@/lib/theme";

/**
 * Hook for playing theme-specific feedback audio
 *
 * Falls back to generic sound effects if theme audio is not available
 */
export function useThemeFeedback() {
  const { currentTheme, isLoading } = useTheme();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPlayedRef = useRef<{ category: string; index: number }>({
    category: "",
    index: -1,
  });

  /**
   * Get a random audio URL from the category, avoiding repeats
   */
  const getRandomUrl = useCallback(
    (category: "correct" | "encourage" | "celebrate"): string | null => {
      const urls = currentTheme?.feedbackAudioUrls?.[category];
      if (!urls || urls.length === 0) return null;

      // Filter out empty URLs
      const validUrls = urls.filter((url) => url && url.length > 0);
      if (validUrls.length === 0) return null;

      // Try to avoid repeating the last played audio in this category
      let randomIndex: number;
      if (
        validUrls.length > 1 &&
        lastPlayedRef.current.category === category
      ) {
        do {
          randomIndex = Math.floor(Math.random() * validUrls.length);
        } while (randomIndex === lastPlayedRef.current.index);
      } else {
        randomIndex = Math.floor(Math.random() * validUrls.length);
      }

      lastPlayedRef.current = { category, index: randomIndex };
      return validUrls[randomIndex];
    },
    [currentTheme]
  );

  /**
   * Play audio from URL
   */
  const playAudio = useCallback((url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        audioRef.current = null;
        resolve();
      };

      audio.onerror = () => {
        audioRef.current = null;
        reject(new Error("Failed to play audio"));
      };

      audio.play().catch(reject);
    });
  }, []);

  /**
   * Play a random "correct" feedback phrase
   */
  const playCorrectFeedback = useCallback(async (): Promise<boolean> => {
    const url = getRandomUrl("correct");
    if (!url) return false;

    try {
      await playAudio(url);
      return true;
    } catch (error) {
      console.warn("Failed to play correct feedback:", error);
      return false;
    }
  }, [getRandomUrl, playAudio]);

  /**
   * Play a random "encourage" feedback phrase
   */
  const playEncourageFeedback = useCallback(async (): Promise<boolean> => {
    const url = getRandomUrl("encourage");
    if (!url) return false;

    try {
      await playAudio(url);
      return true;
    } catch (error) {
      console.warn("Failed to play encourage feedback:", error);
      return false;
    }
  }, [getRandomUrl, playAudio]);

  /**
   * Play a random "celebrate" feedback phrase
   */
  const playCelebrateFeedback = useCallback(async (): Promise<boolean> => {
    const url = getRandomUrl("celebrate");
    if (!url) return false;

    try {
      await playAudio(url);
      return true;
    } catch (error) {
      console.warn("Failed to play celebrate feedback:", error);
      return false;
    }
  }, [getRandomUrl, playAudio]);

  /**
   * Stop any currently playing feedback
   */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  /**
   * Check if theme has audio for a category
   */
  const hasAudio = useCallback(
    (category: "correct" | "encourage" | "celebrate"): boolean => {
      const urls = currentTheme?.feedbackAudioUrls?.[category];
      return !!urls && urls.some((url) => url && url.length > 0);
    },
    [currentTheme]
  );

  return {
    playCorrectFeedback,
    playEncourageFeedback,
    playCelebrateFeedback,
    stop,
    hasAudio,
    isReady: !isLoading && !!currentTheme,
  };
}

/**
 * Get a random text feedback phrase from the theme
 * Useful for displaying text alongside audio
 */
export function useThemeFeedbackText() {
  const { currentTheme } = useTheme();

  const getRandomPhrase = useCallback(
    (category: "correct" | "encourage" | "celebrate"): string | null => {
      const phrases = currentTheme?.feedbackPhrases?.[category];
      if (!phrases || phrases.length === 0) return null;

      const randomIndex = Math.floor(Math.random() * phrases.length);
      return phrases[randomIndex];
    },
    [currentTheme]
  );

  return {
    getCorrectPhrase: () => getRandomPhrase("correct"),
    getEncouragePhrase: () => getRandomPhrase("encourage"),
    getCelebratePhrase: () => getRandomPhrase("celebrate"),
  };
}
