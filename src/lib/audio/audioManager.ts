// Simple audio manager using HTML5 Audio
// Howler.js removed for simplicity - can add back if needed for advanced features

let globalVolume = 0.8;
let isMuted = false;

/**
 * Play audio for a word
 */
export function playWord(word: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isMuted) {
      resolve();
      return;
    }

    const audio = new Audio(`/api/audio/${encodeURIComponent(word.toLowerCase())}`);
    audio.volume = globalVolume;

    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error(`Failed to play audio for "${word}"`));

    audio.play().catch(reject);
  });
}

/**
 * Set global volume (0-1)
 */
export function setVolume(volume: number): void {
  globalVolume = Math.max(0, Math.min(1, volume));
}

/**
 * Mute/unmute all audio
 */
export function setMuted(muted: boolean): void {
  isMuted = muted;
}

/**
 * Preload words (creates Audio elements to trigger browser caching)
 */
export function preloadWords(words: string[]): void {
  words.forEach((word) => {
    const audio = new Audio(`/api/audio/${encodeURIComponent(word.toLowerCase())}`);
    audio.preload = "auto";
  });
}

// Unused - kept for API compatibility
export function stopAll(): void {}
export function unloadAll(): void {}
