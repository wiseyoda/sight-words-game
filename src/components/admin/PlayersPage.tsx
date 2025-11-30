"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Player, Theme } from "@/lib/db/schema";

// Avatar options for player profiles
const AVATAR_OPTIONS = [
  "🦁", "🐯", "🐻", "🐼", "🐨", "🦊", "🐰", "🐶",
  "🐱", "🦄", "🐸", "🐢", "🦋", "🐝", "🌟", "🚀",
  "🎨", "⚽", "🎸", "🎪", "🌈", "🦖", "🐙", "🦩",
];

// For O(1) avatar validation
const AVATAR_SET = new Set(AVATAR_OPTIONS);

interface PlayerWithProgress extends Player {
  completedMissions: number;
}

interface PlayersPageProps {
  players: PlayerWithProgress[];
  themes: Theme[];
}

type ModalMode = "create" | "edit" | "delete" | null;

export function PlayersPage({ players: initialPlayers, themes }: PlayersPageProps) {
  const [players, setPlayers] = useState(initialPlayers);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerWithProgress | null>(null);
  const [formData, setFormData] = useState({ name: "", avatarId: "🦁" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreateModal = () => {
    setFormData({ name: "", avatarId: "🦁" });
    setError(null);
    setModalMode("create");
  };

  const openEditModal = (player: PlayerWithProgress) => {
    setSelectedPlayer(player);
    setFormData({ name: player.name, avatarId: player.avatarId || "🦁" });
    setError(null);
    setModalMode("edit");
  };

  const openDeleteModal = (player: PlayerWithProgress) => {
    setSelectedPlayer(player);
    setError(null);
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedPlayer(null);
    setError(null);
  };

  const handleCreate = useCallback(async () => {
    if (!formData.name.trim()) {
      setError("Please enter a name");
      return;
    }

    if (!AVATAR_SET.has(formData.avatarId)) {
      setError("Please select a valid avatar");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          avatarId: formData.avatarId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create player");
      }

      const newPlayer = await response.json();
      setPlayers((prev) => [{ ...newPlayer, completedMissions: 0 }, ...prev]);
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create player");
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  const handleEdit = useCallback(async () => {
    if (!selectedPlayer) return;
    if (!formData.name.trim()) {
      setError("Please enter a name");
      return;
    }

    if (!AVATAR_SET.has(formData.avatarId)) {
      setError("Please select a valid avatar");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/players/${selectedPlayer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          avatarId: formData.avatarId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update player");
      }

      const updatedPlayer = await response.json();
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === selectedPlayer.id
            ? { ...updatedPlayer, completedMissions: p.completedMissions }
            : p
        )
      );
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update player");
    } finally {
      setIsLoading(false);
    }
  }, [selectedPlayer, formData]);

  const handleDelete = useCallback(async () => {
    if (!selectedPlayer) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/players/${selectedPlayer.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete player");
      }

      setPlayers((prev) => prev.filter((p) => p.id !== selectedPlayer.id));
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete player");
    } finally {
      setIsLoading(false);
    }
  }, [selectedPlayer]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Players</h1>
          <p className="text-gray-500 mt-1">
            Manage player profiles and settings
          </p>
        </div>
        <button
          onClick={openCreateModal}
          disabled={players.length >= 5}
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
        >
          <span>+</span>
          Add Player
        </button>
      </div>

      {/* Limit notice */}
      {players.length >= 5 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800">
          Maximum of 5 players reached. Delete a player to add a new one.
        </div>
      )}

      {/* Player Grid */}
      {players.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Players Yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create a player profile to start tracking progress
          </p>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition"
          >
            Create First Player
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Player Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                    {player.avatarId || "👤"}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{player.name}</h3>
                    <p className="text-indigo-100 text-sm">
                      Joined {new Date(player.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Player Stats */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {player.totalStars || 0}
                    </div>
                    <div className="text-xs text-gray-500">Stars Earned</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {player.completedMissions}
                    </div>
                    <div className="text-xs text-gray-500">Missions Done</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((player.totalPlayTimeSeconds || 0) / 60)}
                  </div>
                  <div className="text-xs text-gray-500">Minutes Played</div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => openEditModal(player)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(player)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {modalMode === "create" && "Create New Player"}
                  {modalMode === "edit" && "Edit Player"}
                  {modalMode === "delete" && "Delete Player"}
                </h2>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {modalMode === "delete" ? (
                  <div className="text-center">
                    <div className="text-5xl mb-4">
                      {selectedPlayer?.avatarId || "👤"}
                    </div>
                    <p className="text-gray-700 mb-2">
                      Are you sure you want to delete{" "}
                      <strong>{selectedPlayer?.name}</strong>?
                    </p>
                    <p className="text-sm text-red-600">
                      This will permanently remove all progress and data.
                      This action cannot be undone.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Name Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Player Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, name: e.target.value }))
                        }
                        placeholder="Enter name"
                        maxLength={50}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        autoFocus
                      />
                    </div>

                    {/* Avatar Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Choose Avatar
                      </label>
                      <div className="grid grid-cols-8 gap-2">
                        {AVATAR_OPTIONS.map((avatar) => (
                          <button
                            key={avatar}
                            type="button"
                            onClick={() =>
                              setFormData((f) => ({ ...f, avatarId: avatar }))
                            }
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition ${
                              formData.avatarId === avatar
                                ? "bg-indigo-100 ring-2 ring-indigo-500"
                                : "bg-gray-100 hover:bg-gray-200"
                            }`}
                          >
                            {avatar}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={closeModal}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
                >
                  Cancel
                </button>
                {modalMode === "delete" ? (
                  <button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                  >
                    {isLoading ? "Deleting..." : "Delete Player"}
                  </button>
                ) : (
                  <button
                    onClick={modalMode === "create" ? handleCreate : handleEdit}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {isLoading
                      ? "Saving..."
                      : modalMode === "create"
                      ? "Create Player"
                      : "Save Changes"}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
