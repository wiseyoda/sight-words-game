"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Mission, Sentence, Campaign, Theme, MissionArtwork, UnlockReward } from "@/lib/db/schema";

interface MissionWithDetails extends Mission {
  sentences?: Sentence[];
  campaign?: CampaignWithTheme;
}

interface CampaignWithTheme extends Campaign {
  theme?: Theme;
}

interface UnassignedSentence extends Sentence {
  theme?: Theme | null;
}

const MISSION_TYPES = [
  { value: "play", label: "Play", icon: "⭐" },
  { value: "treasure", label: "Treasure", icon: "🎁" },
  { value: "boss", label: "Boss", icon: "👑" },
];

const REWARD_TYPES = [
  { value: "sticker", label: "Sticker" },
  { value: "avatar", label: "Avatar" },
  { value: "minigame", label: "Mini-game" },
];

function SentenceCard({
  sentence,
  index,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  sentence: Sentence;
  index: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg group">
      <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-700 text-sm font-medium rounded">
        {index + 1}
      </span>

      <div className="flex-1">
        <p className="text-gray-900">{sentence.text}</p>
        <p className="text-xs text-gray-500 mt-1">
          {sentence.orderedWords?.length || 0} words
          {sentence.distractors && (sentence.distractors as string[]).length > 0 && (
            <span className="ml-2 text-orange-600">
              +{(sentence.distractors as string[]).length} distractors
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
        <button
          onClick={onRemove}
          className="p-1 text-red-400 hover:text-red-600"
          title="Remove from mission"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function UnassignedSentenceCard({
  sentence,
  onAssign,
}: {
  sentence: UnassignedSentence;
  onAssign: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <p className="text-gray-700">{sentence.text}</p>
        <p className="text-xs text-gray-500 mt-1">
          {sentence.orderedWords?.length || 0} words
          {sentence.theme && (
            <span className="ml-2 text-purple-600">{sentence.theme.displayName}</span>
          )}
        </p>
      </div>
      <button
        onClick={onAssign}
        className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-100 rounded"
      >
        + Add
      </button>
    </div>
  );
}

export function MissionEditorPage({ missionId }: { missionId: string }) {
  const [mission, setMission] = useState<MissionWithDetails | null>(null);
  const [unassignedSentences, setUnassignedSentences] = useState<UnassignedSentence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        // Load mission with sentences
        const missionRes = await fetch(`/api/admin/missions/${missionId}`);
        if (!missionRes.ok) throw new Error("Failed to load mission");
        const missionData = await missionRes.json();
        setMission(missionData.mission);

        // Load unassigned sentences
        const sentencesRes = await fetch("/api/admin/sentences?unassigned=true");
        if (!sentencesRes.ok) throw new Error("Failed to load sentences");
        const sentencesData = await sentencesRes.json();
        setUnassignedSentences(sentencesData.sentences || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [missionId]);

  const handleChange = useCallback((updates: Partial<MissionWithDetails>) => {
    setMission((prev) => (prev ? { ...prev, ...updates } : null));
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    if (!mission) return;
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/missions/${missionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: mission.title,
          type: mission.type,
          narrativeIntro: mission.narrativeIntro,
          narrativeOutro: mission.narrativeOutro,
          scaffoldingLevel: mission.scaffoldingLevel,
          artwork: mission.artwork,
          unlockReward: mission.unlockReward,
          isActive: mission.isActive,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save mission");
      }

      setHasChanges(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save mission");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignSentence = async (sentenceId: string) => {
    try {
      const response = await fetch(`/api/admin/sentences/${sentenceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId,
          order: (mission?.sentences?.length || 0) + 1,
        }),
      });

      if (!response.ok) throw new Error("Failed to assign sentence");

      const data = await response.json();

      // Move sentence from unassigned to assigned
      setUnassignedSentences((prev) => prev.filter((s) => s.id !== sentenceId));
      setMission((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          sentences: [...(prev.sentences || []), data.sentence],
        };
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to assign sentence");
    }
  };

  const handleRemoveSentence = async (sentenceId: string) => {
    try {
      const response = await fetch(`/api/admin/sentences/${sentenceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId: null, order: 0 }),
      });

      if (!response.ok) throw new Error("Failed to remove sentence");

      const data = await response.json();

      // Move sentence from assigned to unassigned
      const removedSentence = mission?.sentences?.find((s) => s.id === sentenceId);
      if (removedSentence) {
        setUnassignedSentences((prev) => [...prev, removedSentence]);
      }
      setMission((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          sentences: prev.sentences?.filter((s) => s.id !== sentenceId),
        };
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove sentence");
    }
  };

  const handleMoveSentence = async (sentenceId: string, direction: "up" | "down") => {
    if (!mission?.sentences) return;

    const sentences = [...mission.sentences];
    const index = sentences.findIndex((s) => s.id === sentenceId);
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= sentences.length) return;

    // Swap sentences
    [sentences[index], sentences[newIndex]] = [sentences[newIndex], sentences[index]];

    // Update orders
    const updatedSentences = sentences.map((s, i) => ({ ...s, order: i + 1 }));

    setMission((prev) => (prev ? { ...prev, sentences: updatedSentences } : null));

    // Save order changes
    try {
      await Promise.all(
        updatedSentences.map((s) =>
          fetch(`/api/admin/sentences/${s.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: s.order }),
          })
        )
      );
    } catch (err) {
      alert("Failed to update order");
    }
  };

  const filteredUnassigned = unassignedSentences.filter((s) =>
    s.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error: {error || "Mission not found"}
      </div>
    );
  }

  const sortedSentences = [...(mission.sentences || [])].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/campaigns/${mission.campaignId}`}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            ← Back to Campaign
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{mission.title}</h1>
            {mission.campaign?.theme && (
              <p className="text-sm text-gray-500">
                {mission.campaign.theme.displayName} / {mission.campaign.title}
              </p>
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

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column: Mission Details */}
        <div className="col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mission Details</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={mission.title}
                  onChange={(e) => handleChange({ title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={mission.type}
                    onChange={(e) => handleChange({ type: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <select
                    value={mission.scaffoldingLevel || 1}
                    onChange={(e) => handleChange({ scaffoldingLevel: Number(e.target.value) })}
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
            </div>

            {/* Narratives */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intro Narrative</label>
                <textarea
                  value={mission.narrativeIntro || ""}
                  onChange={(e) => handleChange({ narrativeIntro: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="What the character says at mission start..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Outro Narrative</label>
                <textarea
                  value={mission.narrativeOutro || ""}
                  onChange={(e) => handleChange({ narrativeOutro: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="What the character says on completion..."
                />
              </div>
            </div>

            {/* Artwork */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Mission Artwork</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Intro Image</label>
                  <input
                    type="text"
                    value={mission.artwork?.introImage || ""}
                    onChange={(e) =>
                      handleChange({
                        artwork: { ...mission.artwork, introImage: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="URL"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Outro Image</label>
                  <input
                    type="text"
                    value={mission.artwork?.outroImage || ""}
                    onChange={(e) =>
                      handleChange({
                        artwork: { ...mission.artwork, outroImage: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="URL"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Featured Character ID</label>
                  <input
                    type="text"
                    value={mission.artwork?.character || ""}
                    onChange={(e) =>
                      handleChange({
                        artwork: { ...mission.artwork, character: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="e.g., chase"
                  />
                </div>
              </div>
            </div>

            {/* Unlock Reward */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Unlock Reward (Optional)</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Reward Type</label>
                  <select
                    value={mission.unlockReward?.type || ""}
                    onChange={(e) => {
                      if (!e.target.value) {
                        handleChange({ unlockReward: undefined });
                      } else {
                        handleChange({
                          unlockReward: {
                            ...(mission.unlockReward || { id: "", type: "sticker" }),
                            type: e.target.value as "sticker" | "avatar" | "minigame",
                          },
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">None</option>
                    {REWARD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                {mission.unlockReward && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Reward ID</label>
                      <input
                        type="text"
                        value={mission.unlockReward.id || ""}
                        onChange={(e) =>
                          handleChange({
                            unlockReward: { ...mission.unlockReward!, id: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="e.g., paw-badge"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Display Name</label>
                      <input
                        type="text"
                        value={mission.unlockReward.name || ""}
                        onChange={(e) =>
                          handleChange({
                            unlockReward: { ...mission.unlockReward!, name: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="e.g., Paw Patrol Badge"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={mission.isActive ?? true}
                  onChange={(e) => handleChange({ isActive: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>

          {/* Assigned Sentences */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Assigned Sentences ({sortedSentences.length})
            </h2>

            {sortedSentences.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  No sentences assigned. Add sentences from the pool on the right.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedSentences.map((sentence, index) => (
                  <SentenceCard
                    key={sentence.id}
                    sentence={sentence}
                    index={index}
                    onRemove={() => handleRemoveSentence(sentence.id)}
                    onMoveUp={() => handleMoveSentence(sentence.id, "up")}
                    onMoveDown={() => handleMoveSentence(sentence.id, "down")}
                    isFirst={index === 0}
                    isLast={index === sortedSentences.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Unassigned Sentences */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Unassigned Sentences ({unassignedSentences.length})
            </h2>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sentences..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
            />

            <div className="max-h-[60vh] overflow-y-auto space-y-2">
              {filteredUnassigned.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  {searchQuery ? "No matching sentences" : "All sentences assigned"}
                </p>
              ) : (
                filteredUnassigned.map((sentence) => (
                  <UnassignedSentenceCard
                    key={sentence.id}
                    sentence={sentence}
                    onAssign={() => handleAssignSentence(sentence.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
