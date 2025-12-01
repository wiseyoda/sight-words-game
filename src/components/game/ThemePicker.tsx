"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import type { Theme, Campaign, Mission } from "@/lib/db/schema";

interface ThemeWithDetails extends Theme {
  campaigns?: CampaignWithMissions[];
}

interface CampaignWithMissions extends Campaign {
  missions?: Mission[];
}

interface ThemeProgress {
  themeId: string;
  totalMissions: number;
  completedMissions: number;
  totalStars: number;
  maxStars: number;
}

interface ThemePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (themeId: string) => void;
  playerId?: string;
}

export function ThemePicker({ isOpen, onClose, onSelect, playerId }: ThemePickerProps) {
  const { currentTheme, switchTheme, prefersReducedMotion } = useTheme();
  const [themes, setThemes] = useState<ThemeWithDetails[]>([]);
  const [progress, setProgress] = useState<Map<string, ThemeProgress>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadThemesAndProgress() {
      try {
        // Fetch themes and progress in parallel
        const [themesResponse, progressResponse] = await Promise.all([
          fetch("/api/themes"),
          fetch("/api/players/progress-by-theme"),
        ]);

        if (!themesResponse.ok) throw new Error("Failed to load themes");
        const themesData = await themesResponse.json();
        setThemes(themesData.themes || []);

        // Build progress map from player's actual progress
        const progressMap = new Map<string, ThemeProgress>();

        // Get actual progress if available
        let playerProgress: Record<string, ThemeProgress> = {};
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          playerProgress = progressData.progress || {};
        }

        // Merge theme data with player progress
        for (const theme of (themesData.themes || []) as ThemeWithDetails[]) {
          const totalMissions = theme.campaigns?.reduce(
            (acc, c) => acc + (c.missions?.length || 0),
            0
          ) || 0;

          // Use actual progress if available, otherwise default to 0
          const actualProgress = playerProgress[theme.id];
          progressMap.set(theme.id, {
            themeId: theme.id,
            totalMissions,
            completedMissions: actualProgress?.completedMissions || 0,
            totalStars: actualProgress?.totalStars || 0,
            maxStars: totalMissions * 3,
          });
        }
        setProgress(progressMap);
      } catch (err) {
        console.error("Failed to load themes:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (isOpen) {
      loadThemesAndProgress();
      setSelectedId(currentTheme?.id || null);
    }
  }, [isOpen, currentTheme?.id]);

  const handleSelect = async (theme: ThemeWithDetails) => {
    setSelectedId(theme.id);

    // Update the theme context and CSS variables
    await switchTheme(theme.id);

    // Persist the theme selection to the database
    try {
      const response = await fetch("/api/player/select-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId: theme.id }),
      });

      if (!response.ok) {
        console.error("Failed to persist theme selection");
      }
    } catch (error) {
      console.error("Error persisting theme selection:", error);
    }

    onSelect?.(theme.id);
    onClose();
  };

  // Filter to only active themes with content
  const availableThemes = themes.filter(
    (t) => t.isActive && t.campaigns && t.campaigns.length > 0
  );

  // Handle Escape key to close modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="theme-picker-title"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
          {/* Header */}
          <div
            className="p-6 text-center"
            style={{
              background: "linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))",
            }}
          >
            <h2 id="theme-picker-title" className="text-3xl font-bold text-white mb-2">Choose Your Adventure</h2>
            <p className="text-white/80">Select a theme to start your word journey</p>
          </div>

          {/* Theme Grid */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
              </div>
            ) : availableThemes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No themes available yet.</p>
                <p className="text-sm text-gray-400 mt-2">Run the seed script to add content.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {availableThemes.map((theme) => {
                  const isSelected = selectedId === theme.id;
                  const missionCount =
                    theme.campaigns?.reduce((acc, c) => acc + (c.missions?.length || 0), 0) || 0;
                  const themeProgress = progress.get(theme.id);
                  const progressPercent = themeProgress && themeProgress.totalMissions > 0
                    ? Math.round((themeProgress.completedMissions / themeProgress.totalMissions) * 100)
                    : 0;

                  return (
                    <motion.button
                      key={theme.id}
                      onClick={() => handleSelect(theme)}
                      className={`relative overflow-hidden rounded-2xl text-left transition-all ${
                        isSelected ? "ring-4 ring-white shadow-2xl scale-105" : "hover:scale-102"
                      }`}
                      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                    >
                      {/* Background gradient */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: theme.palette
                            ? `linear-gradient(135deg, ${theme.palette.primary}, ${theme.palette.secondary})`
                            : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        }}
                      />

                      {/* Pattern overlay */}
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage: "radial-gradient(white 1px, transparent 1px)",
                          backgroundSize: "20px 20px",
                        }}
                      />

                      {/* Content */}
                      <div className="relative p-5 text-white">
                        {/* Selection indicator */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                          >
                            <span className="text-green-600 text-sm">✓</span>
                          </motion.div>
                        )}

                        <h3 className="text-xl font-bold mb-1">{theme.displayName}</h3>

                        {/* Stats */}
                        <div className="flex gap-4 text-sm text-white/80 mb-2">
                          <span>{theme.campaigns?.length || 0} campaign{(theme.campaigns?.length || 0) !== 1 ? "s" : ""}</span>
                          <span>{missionCount} mission{missionCount !== 1 ? "s" : ""}</span>
                        </div>

                        {/* Progress bar */}
                        {themeProgress && themeProgress.totalMissions > 0 && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-white/70 mb-1">
                              <span>{themeProgress.completedMissions}/{themeProgress.totalMissions} missions</span>
                              <span>{themeProgress.totalStars}⭐</span>
                            </div>
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-white/80 rounded-full transition-all"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Characters preview */}
                        {theme.characters && theme.characters.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {theme.characters.slice(0, 4).map((char) => (
                              <span
                                key={char.id}
                                className="px-2 py-0.5 text-xs font-medium bg-white/20 rounded-full"
                              >
                                {char.name}
                              </span>
                            ))}
                            {theme.characters.length > 4 && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-white/20 rounded-full">
                                +{theme.characters.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {currentTheme ? `Currently: ${currentTheme.displayName}` : "No theme selected"}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}

// Button component to trigger the theme picker
export function ThemePickerButton({ onClick }: { onClick: () => void }) {
  const { currentTheme } = useTheme();

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 border border-white/60 shadow-sm hover:shadow-md transition-all text-sm font-medium"
      style={{ color: "var(--theme-text)" }}
    >
      <span className="text-lg">🎨</span>
      <span>{currentTheme?.displayName || "Choose Theme"}</span>
      <span className="text-gray-400">▼</span>
    </button>
  );
}
