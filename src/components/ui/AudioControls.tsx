"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioSettings } from "@/lib/audio/AudioContext";

interface MuteToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Simple mute toggle button for game interface
 */
export function MuteToggle({ className = "", size = "md" }: MuteToggleProps) {
  const { isMuted, toggleMute } = useAudioSettings();

  const sizeClasses = {
    sm: "w-10 h-10 text-lg",
    md: "w-12 h-12 text-xl",
    lg: "w-14 h-14 text-2xl",
  };

  return (
    <motion.button
      onClick={toggleMute}
      className={`${sizeClasses[size]} rounded-full bg-white/90 shadow-lg border-2 border-white/60 flex items-center justify-center transition-colors hover:bg-white ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isMuted ? "Unmute audio" : "Mute audio"}
      title={isMuted ? "Turn sound on" : "Turn sound off"}
    >
      {isMuted ? (
        <span role="img" aria-hidden="true">
          🔇
        </span>
      ) : (
        <span role="img" aria-hidden="true">
          🔊
        </span>
      )}
    </motion.button>
  );
}

interface VolumeSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon?: string;
}

/**
 * Individual volume slider with label
 */
function VolumeSlider({ label, value, onChange, icon }: VolumeSliderProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {label}
        </span>
        <span className="text-gray-500">{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value * 100}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        aria-label={`${label} volume`}
      />
    </div>
  );
}

interface AudioControlsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Full audio controls panel with all volume sliders
 */
export function AudioControlsPanel({ isOpen, onClose }: AudioControlsPanelProps) {
  const {
    isMuted,
    masterVolume,
    musicVolume,
    sfxVolume,
    voiceVolume,
    toggleMute,
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,
    setVoiceVolume,
  } = useAudioSettings();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 z-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Sound Settings</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Master mute */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-4">
              <span className="font-medium text-gray-700">All Sounds</span>
              <button
                onClick={toggleMute}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  isMuted
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {isMuted ? "Muted" : "On"}
              </button>
            </div>

            {/* Volume sliders */}
            <div className={`space-y-4 ${isMuted ? "opacity-50 pointer-events-none" : ""}`}>
              <VolumeSlider
                label="Master"
                value={masterVolume}
                onChange={setMasterVolume}
                icon="🎚️"
              />
              <VolumeSlider
                label="Voice"
                value={voiceVolume}
                onChange={setVoiceVolume}
                icon="🗣️"
              />
              <VolumeSlider
                label="Sound Effects"
                value={sfxVolume}
                onChange={setSfxVolume}
                icon="✨"
              />
              <VolumeSlider
                label="Music"
                value={musicVolume}
                onChange={setMusicVolume}
                icon="🎵"
              />
            </div>

            {/* Kid-friendly presets */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Quick Settings</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMasterVolume(0.5);
                    setVoiceVolume(1);
                    setSfxVolume(0.5);
                    setMusicVolume(0.3);
                  }}
                  className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Quiet Mode
                </button>
                <button
                  onClick={() => {
                    setMasterVolume(0.8);
                    setVoiceVolume(0.9);
                    setSfxVolume(0.7);
                    setMusicVolume(0.6);
                  }}
                  className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  Normal
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Combined mute button + expandable settings panel
 */
export function AudioControlsButton({ className = "" }: { className?: string }) {
  const [showPanel, setShowPanel] = useState(false);
  const { isMuted, toggleMute } = useAudioSettings();

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-1">
        {/* Main mute toggle */}
        <motion.button
          onClick={toggleMute}
          className="w-12 h-12 rounded-full bg-white/90 shadow-lg border-2 border-white/60 flex items-center justify-center transition-colors hover:bg-white text-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
        >
          {isMuted ? "🔇" : "🔊"}
        </motion.button>

        {/* Settings expander */}
        <motion.button
          onClick={() => setShowPanel(true)}
          className="w-8 h-8 rounded-full bg-white/70 shadow-md border border-white/60 flex items-center justify-center text-sm hover:bg-white transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open sound settings"
        >
          ⚙️
        </motion.button>
      </div>

      <AudioControlsPanel isOpen={showPanel} onClose={() => setShowPanel(false)} />
    </div>
  );
}
