"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { setVolume as setAudioVolume, setMuted as setAudioMuted } from "./audioManager";

interface AudioSettings {
  isMuted: boolean;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
}

interface AudioContextValue extends AudioSettings {
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setVoiceVolume: (volume: number) => void;
  getEffectiveVolume: (type: "music" | "sfx" | "voice") => number;
}

const STORAGE_KEY = "sight-words-audio-settings";

const DEFAULT_SETTINGS: AudioSettings = {
  isMuted: false,
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.7,
  voiceVolume: 0.9,
};

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AudioSettings>;
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore localStorage errors
    }
    setIsHydrated(true);
  }, []);

  // Persist settings to localStorage and sync with audio manager
  useEffect(() => {
    if (!isHydrated) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore localStorage errors
    }

    // Sync with low-level audio manager (uses master volume only)
    setAudioMuted(settings.isMuted);
    setAudioVolume(settings.masterVolume);
  }, [settings, isHydrated]);

  const toggleMute = useCallback(() => {
    setSettings((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    setSettings((prev) => ({ ...prev, isMuted: muted }));
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    setSettings((prev) => ({
      ...prev,
      masterVolume: Math.max(0, Math.min(1, volume)),
    }));
  }, []);

  const setMusicVolume = useCallback((volume: number) => {
    setSettings((prev) => ({
      ...prev,
      musicVolume: Math.max(0, Math.min(1, volume)),
    }));
  }, []);

  const setSfxVolume = useCallback((volume: number) => {
    setSettings((prev) => ({
      ...prev,
      sfxVolume: Math.max(0, Math.min(1, volume)),
    }));
  }, []);

  const setVoiceVolume = useCallback((volume: number) => {
    setSettings((prev) => ({
      ...prev,
      voiceVolume: Math.max(0, Math.min(1, volume)),
    }));
  }, []);

  const getEffectiveVolume = useCallback(
    (type: "music" | "sfx" | "voice") => {
      if (settings.isMuted) return 0;
      const typeVolume =
        type === "music"
          ? settings.musicVolume
          : type === "sfx"
            ? settings.sfxVolume
            : settings.voiceVolume;
      return settings.masterVolume * typeVolume;
    },
    [settings]
  );

  const value = useMemo<AudioContextValue>(
    () => ({
      ...settings,
      toggleMute,
      setMuted,
      setMasterVolume,
      setMusicVolume,
      setSfxVolume,
      setVoiceVolume,
      getEffectiveVolume,
    }),
    [
      settings,
      toggleMute,
      setMuted,
      setMasterVolume,
      setMusicVolume,
      setSfxVolume,
      setVoiceVolume,
      getEffectiveVolume,
    ]
  );

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

export function useAudioSettings(): AudioContextValue {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudioSettings must be used within an AudioProvider");
  }
  return context;
}
