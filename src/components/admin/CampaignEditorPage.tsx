"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Campaign, Mission, Sentence, Theme, CampaignArtwork, MissionArtwork } from "@/lib/db/schema";

interface MissionWithSentences extends Mission {
  sentences?: Sentence[];
}

interface CampaignWithDetails extends Campaign {
  theme?: Theme;
  missions?: MissionWithSentences[];
}

const MISSION_TYPES = [
  { value: "play", label: "Play", icon: "⭐" },
  { value: "treasure", label: "Treasure", icon: "🎁" },
  { value: "boss", label: "Boss", icon: "👑" },
];

function MissionCard({
  mission,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  mission: MissionWithSentences;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const typeInfo = MISSION_TYPES.find((t) => t.value === mission.type) || MISSION_TYPES[0];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{typeInfo.icon}</span>
          <div>
            <h4 className="font-medium text-gray-900">
              {mission.order}. {mission.title}
            </h4>
            <p className="text-sm text-gray-500">
              Level {mission.scaffoldingLevel} • {mission.sentences?.length || 0} sentences
            </p>
            {mission.narrativeIntro && (
              <p className="text-sm text-gray-400 mt-1 italic truncate max-w-md">
                {mission.narrativeIntro}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <button
              onClick={onMoveUp}
              disabled={isFirst}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              title="Move up"
            >
              ▲
            </button>
            <button
              onClick={onMoveDown}
              disabled={isLast}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              title="Move down"
            >
              ▼
            </button>
          </div>
          <Link
            href={`/admin/missions/${mission.id}`}
            className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded"
          >
            Edit
          </Link>
          <button
            onClick={onDelete}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateMissionModal({
  isOpen,
  onClose,
  onCreate,
  campaignId,
  nextOrder,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (mission: Mission) => void;
  campaignId: string;
  nextOrder: number;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("play");
  const [scaffoldingLevel, setScaffoldingLevel] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type,
          scaffoldingLevel,
          campaignId,
          order: nextOrder,
          isActive: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create mission");
      }

      const data = await response.json();
      onCreate(data.mission);
      setTitle("");
      setType("play");
      setScaffoldingLevel(1);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create mission");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create New Mission</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mission Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chase to the Rescue"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {MISSION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.icon} {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scaffolding Level
              </label>
              <select
                value={scaffoldingLevel}
                onChange={(e) => setScaffoldingLevel(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {[1, 2, 3, 4, 5].map((l) => (
                  <option key={l} value={l}>
                    Level {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Mission"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CampaignEditorPage({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<CampaignWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showCreateMission, setShowCreateMission] = useState(false);

  useEffect(() => {
    async function loadCampaign() {
      try {
        const response = await fetch(`/api/admin/campaigns/${campaignId}`);
        if (!response.ok) throw new Error("Failed to load campaign");
        const data = await response.json();
        setCampaign(data.campaign);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }
    loadCampaign();
  }, [campaignId]);

  const handleChange = useCallback((updates: Partial<CampaignWithDetails>) => {
    setCampaign((prev) => (prev ? { ...prev, ...updates } : null));
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    if (!campaign) return;
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: campaign.title,
          synopsis: campaign.synopsis,
          artwork: campaign.artwork,
          isActive: campaign.isActive,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save campaign");
      }

      setHasChanges(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save campaign");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMission = async (missionId: string) => {
    if (!confirm("Delete this mission? All sentences will be unassigned.")) return;

    try {
      const response = await fetch(`/api/admin/missions/${missionId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete mission");

      setCampaign((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          missions: prev.missions?.filter((m) => m.id !== missionId),
        };
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete mission");
    }
  };

  const handleMoveMission = async (missionId: string, direction: "up" | "down") => {
    if (!campaign?.missions) return;

    const missions = [...campaign.missions];
    const index = missions.findIndex((m) => m.id === missionId);
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= missions.length) return;

    // Swap missions
    [missions[index], missions[newIndex]] = [missions[newIndex], missions[index]];

    // Update orders
    const updatedMissions = missions.map((m, i) => ({ ...m, order: i + 1 }));

    setCampaign((prev) => (prev ? { ...prev, missions: updatedMissions } : null));

    // Save order changes
    try {
      await Promise.all(
        updatedMissions.map((m) =>
          fetch(`/api/admin/missions/${m.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: m.order }),
          })
        )
      );
    } catch (err) {
      alert("Failed to update order");
    }
  };

  const handleCreateMission = (mission: Mission) => {
    setCampaign((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        missions: [...(prev.missions || []), { ...mission, sentences: [] }],
      };
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error: {error || "Campaign not found"}
      </div>
    );
  }

  const sortedMissions = [...(campaign.missions || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/themes/${campaign.themeId}`}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            ← Back to Theme
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
            {campaign.theme && (
              <p className="text-sm text-gray-500">Theme: {campaign.theme.displayName}</p>
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            hasChanges
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isSaving ? "Saving..." : hasChanges ? "Save Changes" : "Saved"}
        </button>
      </div>

      {/* Campaign Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={campaign.title}
              onChange={(e) => handleChange({ title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={campaign.isActive ?? true}
                onChange={(e) => handleChange({ isActive: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Synopsis</label>
          <textarea
            value={campaign.synopsis || ""}
            onChange={(e) => handleChange({ synopsis: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows={2}
          />
        </div>

        {/* Artwork */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Campaign Artwork</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Background Image</label>
              <input
                type="text"
                value={campaign.artwork?.background || ""}
                onChange={(e) =>
                  handleChange({
                    artwork: { ...campaign.artwork, background: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="URL to background image"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Default Intro Image</label>
              <input
                type="text"
                value={campaign.artwork?.introImage || ""}
                onChange={(e) =>
                  handleChange({
                    artwork: { ...campaign.artwork, introImage: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="URL to default intro image"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Missions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Missions ({sortedMissions.length})
          </h2>
          <button
            onClick={() => setShowCreateMission(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <span>+</span>
            Add Mission
          </button>
        </div>

        {sortedMissions.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No missions yet. Add your first mission to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedMissions.map((mission, index) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onEdit={() => router.push(`/admin/missions/${mission.id}`)}
                onDelete={() => handleDeleteMission(mission.id)}
                onMoveUp={() => handleMoveMission(mission.id, "up")}
                onMoveDown={() => handleMoveMission(mission.id, "down")}
                isFirst={index === 0}
                isLast={index === sortedMissions.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      <CreateMissionModal
        isOpen={showCreateMission}
        onClose={() => setShowCreateMission(false)}
        onCreate={handleCreateMission}
        campaignId={campaignId}
        nextOrder={sortedMissions.length + 1}
      />
    </div>
  );
}
