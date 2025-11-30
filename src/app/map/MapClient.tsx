"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StoryMap, type MapNode } from "@/components/game/StoryMap";
import { useTheme } from "@/lib/theme";

interface MapClientProps {
  playerId: string;
  initialThemeId?: string;
  campaignId?: string;
  currentMissionId?: string;
}

interface ProgressData {
  currentCampaign: {
    id: string;
    title: string;
    synopsis: string;
  } | null;
  missions: {
    missionId: string;
    title: string;
    type: string;
    order: number;
    isCompleted: boolean;
    isUnlocked: boolean;
    isCurrent: boolean;
    stars: number;
  }[];
}

export default function MapClient({
  playerId,
  initialThemeId,
  campaignId,
  currentMissionId,
}: MapClientProps) {
  const router = useRouter();
  const { currentTheme, switchTheme, isLoading: themeLoading } = useTheme();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load theme if provided
  useEffect(() => {
    if (initialThemeId && !currentTheme) {
      switchTheme(initialThemeId);
    }
  }, [initialThemeId, currentTheme, switchTheme]);

  // Load player progress
  useEffect(() => {
    async function loadProgress() {
      try {
        const response = await fetch(`/api/progress?playerId=${playerId}`);
        if (!response.ok) {
          throw new Error("Failed to load progress");
        }
        const data = await response.json();
        setProgress(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    loadProgress();
  }, [playerId]);

  const handleNodeTap = (nodeId: string) => {
    // Navigate to play with the selected mission
    router.push(`/play?missionId=${nodeId}`);
  };

  const handleBack = () => {
    router.push("/");
  };

  if (isLoading || themeLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--theme-background)" }}
      >
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🐾</div>
          <p style={{ color: "var(--theme-text)" }}>Loading adventure...</p>
        </div>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error || "Failed to load progress"}</p>
        </div>
      </div>
    );
  }

  // Convert progress data to MapNode format
  const mapNodes: MapNode[] = progress.missions.map((m) => ({
    id: m.missionId,
    type: m.type as "play" | "treasure" | "boss" | "minigame",
    title: m.title,
    unlocked: m.isUnlocked,
    completed: m.isCompleted,
    starsEarned: m.stars > 0 ? (m.stars as 1 | 2 | 3) : undefined,
    isCurrent: m.isCurrent,
  }));

  return (
    <StoryMap
      campaignTitle={progress.currentCampaign?.title || "Adventure"}
      nodes={mapNodes}
      onNodeTap={handleNodeTap}
      onBack={handleBack}
    />
  );
}
