"use client";

import { useCallback, useRef } from "react";

// Sound effect URLs - these would ideally be hosted sound files
// For now, we'll use Web Audio API to generate simple tones
const SOUNDS = {
  correct: { frequency: 523.25, duration: 0.15, type: "sine" as OscillatorType }, // C5
  incorrect: { frequency: 200, duration: 0.2, type: "sine" as OscillatorType },
  tap: { frequency: 800, duration: 0.05, type: "sine" as OscillatorType },
  star: { frequency: 880, duration: 0.1, type: "sine" as OscillatorType }, // A5
  fanfare: { frequency: 659.25, duration: 0.3, type: "triangle" as OscillatorType }, // E5
};

type SoundType = keyof typeof SOUNDS;

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const play = useCallback(
    (soundType: SoundType) => {
      try {
        const ctx = getAudioContext();
        const sound = SOUNDS[soundType];

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = sound.type;
        oscillator.frequency.value = sound.frequency;

        // Quick fade out to avoid clicks
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + sound.duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + sound.duration);
      } catch {
        // Audio context may not be available
        console.warn("Sound effect failed to play");
      }
    },
    [getAudioContext]
  );

  const playCorrect = useCallback(() => play("correct"), [play]);
  const playIncorrect = useCallback(() => play("incorrect"), [play]);
  const playTap = useCallback(() => play("tap"), [play]);
  const playStar = useCallback(() => play("star"), [play]);
  const playFanfare = useCallback(() => play("fanfare"), [play]);

  // Play celebratory chord
  const playCelebration = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 (C major chord)

      frequencies.forEach((freq, i) => {
        setTimeout(() => {
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();

          oscillator.type = "triangle";
          oscillator.frequency.value = freq;

          gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);

          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.3);
        }, i * 100);
      });
    } catch {
      console.warn("Celebration sound failed to play");
    }
  }, [getAudioContext]);

  return {
    play,
    playCorrect,
    playIncorrect,
    playTap,
    playStar,
    playFanfare,
    playCelebration,
  };
}
