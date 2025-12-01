"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface Player {
  id: string;
  name: string;
  avatarId: string | null;
  totalStars: number | null;
  currentThemeId: string | null;
  currentCampaignId?: string | null;
  currentTheme?: {
    id: string;
    name: string;
    displayName: string;
  } | null;
}

interface PlayerContextType {
  currentPlayer: Player | null;
  players: Player[];
  isLoading: boolean;
  error: string | null;
  selectPlayer: (playerId: string) => Promise<void>;
  createPlayer: (name: string, avatarId?: string) => Promise<Player>;
  refreshPlayers: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load current player and all players on mount
  useEffect(() => {
    async function loadPlayerData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch current player and all players in parallel
        const [currentResponse, playersResponse] = await Promise.all([
          fetch("/api/players/current"),
          fetch("/api/players"),
        ]);

        if (currentResponse.ok) {
          const currentData = await currentResponse.json();
          setCurrentPlayer(currentData.player || null);
        }

        if (playersResponse.ok) {
          const playersData = await playersResponse.json();
          setPlayers(playersData.players || []);
        }
      } catch (err) {
        console.error("Error loading player data:", err);
        setError("Failed to load player data");
      } finally {
        setIsLoading(false);
      }
    }

    loadPlayerData();
  }, []);

  // Select a player
  const selectPlayer = useCallback(async (playerId: string) => {
    try {
      setError(null);
      const response = await fetch("/api/players/current", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to select player");
      }

      const data = await response.json();
      setCurrentPlayer(data.player);

      // Also update localStorage as a fallback
      if (typeof window !== "undefined") {
        localStorage.setItem("currentPlayerId", playerId);
      }
    } catch (err) {
      console.error("Error selecting player:", err);
      setError(err instanceof Error ? err.message : "Failed to select player");
      throw err;
    }
  }, []);

  // Create a new player
  const createPlayer = useCallback(async (name: string, avatarId?: string): Promise<Player> => {
    try {
      setError(null);
      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatarId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create player");
      }

      const newPlayer = await response.json();

      // Add to players list
      setPlayers((prev) => [newPlayer, ...prev]);

      // Auto-select the new player
      await selectPlayer(newPlayer.id);

      return newPlayer;
    } catch (err) {
      console.error("Error creating player:", err);
      setError(err instanceof Error ? err.message : "Failed to create player");
      throw err;
    }
  }, [selectPlayer]);

  // Refresh the players list
  const refreshPlayers = useCallback(async () => {
    try {
      const response = await fetch("/api/players");
      if (response.ok) {
        const data = await response.json();
        setPlayers(data.players || []);
      }
    } catch (err) {
      console.error("Error refreshing players:", err);
    }
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentPlayer,
        players,
        isLoading,
        error,
        selectPlayer,
        createPlayer,
        refreshPlayers,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
