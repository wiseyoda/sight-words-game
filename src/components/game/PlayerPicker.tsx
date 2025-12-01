"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayer, type Player } from "@/lib/player";
import { useTheme } from "@/lib/theme";

// Avatar options for kids to choose from
const AVATARS = [
  { id: "dog", emoji: "🐕", label: "Dog" },
  { id: "cat", emoji: "🐱", label: "Cat" },
  { id: "rabbit", emoji: "🐰", label: "Bunny" },
  { id: "bear", emoji: "🐻", label: "Bear" },
  { id: "fox", emoji: "🦊", label: "Fox" },
  { id: "lion", emoji: "🦁", label: "Lion" },
  { id: "unicorn", emoji: "🦄", label: "Unicorn" },
  { id: "dragon", emoji: "🐉", label: "Dragon" },
];

function getAvatarEmoji(avatarId: string | null): string {
  const avatar = AVATARS.find((a) => a.id === avatarId);
  return avatar?.emoji || "👤";
}

interface PlayerPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayerSelected?: (player: Player) => void;
}

export function PlayerPicker({ isOpen, onClose, onPlayerSelected }: PlayerPickerProps) {
  const { currentPlayer, players, selectPlayer, createPlayer, isLoading } = usePlayer();
  const { prefersReducedMotion } = useTheme();
  const [mode, setMode] = useState<"select" | "create">("select");
  const [newName, setNewName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(players.length === 0 ? "create" : "select");
      setNewName("");
      setSelectedAvatar(AVATARS[0].id);
      setError(null);
    }
  }, [isOpen, players.length]);

  const handleSelectPlayer = useCallback(
    async (player: Player) => {
      try {
        setError(null);
        await selectPlayer(player.id);
        onPlayerSelected?.(player);
        onClose();
      } catch {
        setError("Failed to select player");
      }
    },
    [selectPlayer, onPlayerSelected, onClose]
  );

  const handleCreatePlayer = useCallback(async () => {
    if (!newName.trim()) {
      setError("Please enter a name");
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      const player = await createPlayer(newName.trim(), selectedAvatar);
      onPlayerSelected?.(player);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create player");
    } finally {
      setIsCreating(false);
    }
  }, [newName, selectedAvatar, createPlayer, onPlayerSelected, onClose]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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
          aria-labelledby="player-picker-title"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="p-6 text-center"
              style={{
                background: "linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))",
              }}
            >
              <h2 id="player-picker-title" className="text-3xl font-bold text-white mb-2">
                {mode === "select" ? "Who's Playing?" : "Create Player"}
              </h2>
              <p className="text-white/80">
                {mode === "select"
                  ? "Choose your player to continue"
                  : "Enter your name and pick an avatar"}
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
                </div>
              ) : mode === "select" ? (
                <div className="space-y-4">
                  {/* Player list */}
                  <div className="space-y-3">
                    {players.map((player) => (
                      <motion.button
                        key={player.id}
                        onClick={() => handleSelectPlayer(player)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-2 ${
                          currentPlayer?.id === player.id
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                        }`}
                        whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                      >
                        <span className="text-4xl">{getAvatarEmoji(player.avatarId)}</span>
                        <div className="flex-1 text-left">
                          <div className="font-bold text-lg text-gray-900">{player.name}</div>
                          <div className="text-sm text-gray-500">
                            {player.totalStars || 0} stars earned
                          </div>
                        </div>
                        {currentPlayer?.id === player.id && (
                          <span className="text-green-600 text-xl">✓</span>
                        )}
                      </motion.button>
                    ))}
                  </div>

                  {/* Create new player button */}
                  {players.length < 5 && (
                    <button
                      onClick={() => setMode("create")}
                      className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                    >
                      <span className="text-2xl">+</span>
                      <span className="font-medium">Add New Player</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Name input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What&apos;s your name?
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                      maxLength={50}
                      autoFocus
                    />
                  </div>

                  {/* Avatar selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pick your avatar
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {AVATARS.map((avatar) => (
                        <button
                          key={avatar.id}
                          onClick={() => setSelectedAvatar(avatar.id)}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            selectedAvatar === avatar.id
                              ? "border-indigo-500 bg-indigo-50 scale-110"
                              : "border-gray-200 hover:border-indigo-300"
                          }`}
                        >
                          <span className="text-3xl block">{avatar.emoji}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Create button */}
                  <button
                    onClick={handleCreatePlayer}
                    disabled={isCreating || !newName.trim()}
                    className="w-full py-4 rounded-xl text-white font-bold text-lg transition-all disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))",
                    }}
                  >
                    {isCreating ? "Creating..." : "Let's Go!"}
                  </button>

                  {/* Back to selection */}
                  {players.length > 0 && (
                    <button
                      onClick={() => setMode("select")}
                      className="w-full py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Back to player list
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {players.length}/5 players
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

// Button component to trigger the player picker
export function PlayerPickerButton({ onClick }: { onClick: () => void }) {
  const { currentPlayer, isLoading } = usePlayer();

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 border border-white/60 shadow-sm hover:shadow-md transition-all text-sm font-medium"
      style={{ color: "var(--theme-text)" }}
    >
      <span className="text-lg">
        {isLoading ? "..." : getAvatarEmoji(currentPlayer?.avatarId || null)}
      </span>
      <span>{isLoading ? "Loading..." : currentPlayer?.name || "Choose Player"}</span>
      <span className="text-gray-400">▼</span>
    </button>
  );
}
