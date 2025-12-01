"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Theme, Campaign, Mission, Sentence, ThemePalette, ThemeCharacter, FeedbackPhrases, ThemeAssets } from "@/lib/db/schema";
import { ThemeArtworkGrid, CharacterArtworkGrid } from "./ArtworkUploader";

interface ThemeWithDetails extends Theme {
  campaigns?: CampaignWithMissions[];
}

interface CampaignWithMissions extends Campaign {
  missions?: MissionWithSentences[];
}

interface MissionWithSentences extends Mission {
  sentences?: Sentence[];
}

type Tab = "general" | "palette" | "characters" | "feedback" | "assets" | "campaigns";

interface TabButtonProps {
  tab: Tab;
  current: Tab;
  onClick: (tab: Tab) => void;
  children: React.ReactNode;
}

function TabButton({ tab, current, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={() => onClick(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        current === tab
          ? "bg-indigo-100 text-indigo-700"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

function ColorPicker({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
            placeholder="#000000"
          />
        </div>
      </div>
    </div>
  );
}

function GeneralTab({
  theme,
  onChange
}: {
  theme: ThemeWithDetails;
  onChange: (updates: Partial<ThemeWithDetails>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input
            type="text"
            value={theme.displayName}
            onChange={(e) => onChange({ displayName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            type="text"
            value={theme.name}
            onChange={(e) => onChange({ name: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={theme.isActive ?? true}
            onChange={(e) => onChange({ isActive: e.target.checked })}
            className="w-4 h-4 text-indigo-600 rounded"
          />
          <span className="text-sm text-gray-700">Active</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={theme.isCustom ?? false}
            onChange={(e) => onChange({ isCustom: e.target.checked })}
            className="w-4 h-4 text-indigo-600 rounded"
          />
          <span className="text-sm text-gray-700">Custom Theme</span>
        </label>
      </div>
    </div>
  );
}

function PaletteTab({
  theme,
  onChange
}: {
  theme: ThemeWithDetails;
  onChange: (updates: Partial<ThemeWithDetails>) => void;
}) {
  const palette = theme.palette || {
    primary: "#3B82F6",
    secondary: "#60A5FA",
    accent: "#F59E0B",
    background: "#F0F9FF",
    cardBackground: "#FFFFFF",
    text: "#1F2937",
    success: "#10B981",
  };

  const updatePalette = (key: keyof ThemePalette, value: string) => {
    onChange({
      palette: { ...palette, [key]: value },
    });
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="p-6 rounded-xl" style={{ backgroundColor: palette.background }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl" style={{ backgroundColor: palette.primary }} />
          <div className="w-16 h-16 rounded-xl" style={{ backgroundColor: palette.secondary }} />
          <div className="w-16 h-16 rounded-xl" style={{ backgroundColor: palette.accent }} />
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: palette.cardBackground }}>
          <p style={{ color: palette.text }}>Sample card text with theme colors</p>
          <span className="inline-block px-2 py-1 rounded text-white text-sm mt-2" style={{ backgroundColor: palette.success }}>
            Success!
          </span>
        </div>
      </div>

      {/* Color Pickers */}
      <div className="grid grid-cols-2 gap-6">
        <ColorPicker label="Primary" value={palette.primary} onChange={(v) => updatePalette("primary", v)} />
        <ColorPicker label="Secondary" value={palette.secondary} onChange={(v) => updatePalette("secondary", v)} />
        <ColorPicker label="Accent" value={palette.accent} onChange={(v) => updatePalette("accent", v)} />
        <ColorPicker label="Background" value={palette.background} onChange={(v) => updatePalette("background", v)} />
        <ColorPicker label="Card Background" value={palette.cardBackground} onChange={(v) => updatePalette("cardBackground", v)} />
        <ColorPicker label="Text" value={palette.text} onChange={(v) => updatePalette("text", v)} />
        <ColorPicker label="Success" value={palette.success} onChange={(v) => updatePalette("success", v)} />
        <ColorPicker label="Special (Optional)" value={palette.special || "#F59E0B"} onChange={(v) => updatePalette("special", v)} />
      </div>
    </div>
  );
}

function CharactersTab({
  theme,
  onChange,
  onRefresh,
}: {
  theme: ThemeWithDetails;
  onChange: (updates: Partial<ThemeWithDetails>) => void;
  onRefresh: () => void;
}) {
  const characters = theme.characters || [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newCharacter, setNewCharacter] = useState<Partial<ThemeCharacter>>({});

  const addCharacter = () => {
    if (!newCharacter.name) return;

    const char: ThemeCharacter = {
      id: newCharacter.name.toLowerCase().replace(/\s+/g, "-"),
      name: newCharacter.name,
      imageUrl: newCharacter.imageUrl || "",
      thumbnailUrl: newCharacter.thumbnailUrl || newCharacter.imageUrl || "",
      vocabulary: newCharacter.vocabulary || [],
    };

    onChange({ characters: [...characters, char] });
    setNewCharacter({});
  };

  const updateCharacter = (id: string, updates: Partial<ThemeCharacter>) => {
    onChange({
      characters: characters.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    });
  };

  const removeCharacter = (id: string) => {
    if (confirm("Remove this character?")) {
      onChange({ characters: characters.filter((c) => c.id !== id) });
    }
  };

  return (
    <div className="space-y-6">
      {/* Character List */}
      <div className="space-y-4">
        {characters.map((char) => (
          <div key={char.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Character Header */}
            <div className="p-4 bg-gray-50">
              {editingId === char.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={char.name}
                    onChange={(e) => updateCharacter(char.id, { name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Character name"
                  />
                  <input
                    type="text"
                    value={char.vocabulary?.join(", ") || ""}
                    onChange={(e) => updateCharacter(char.id, {
                      vocabulary: e.target.value.split(",").map((v) => v.trim()).filter(Boolean)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Vocabulary words (comma-separated)"
                  />
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 text-sm bg-indigo-600 text-white rounded"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {char.imageUrl ? (
                      <img src={char.imageUrl} alt={char.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-2xl">
                        👤
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{char.name}</p>
                      <p className="text-sm text-gray-500">{char.vocabulary?.length || 0} vocabulary words</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setExpandedId(expandedId === char.id ? null : char.id)}
                      className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded"
                    >
                      {expandedId === char.id ? "Hide Images" : "Images"}
                    </button>
                    <button
                      onClick={() => setEditingId(char.id)}
                      className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeCharacter(char.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Character Artwork Section (expandable) */}
            {expandedId === char.id && (
              <div className="p-4 border-t border-gray-200">
                <CharacterArtworkGrid
                  themeId={theme.id}
                  characterId={char.id}
                  characterName={char.name}
                  themeName={theme.displayName}
                  imageUrl={char.imageUrl}
                  thumbnailUrl={char.thumbnailUrl}
                  onUpdate={onRefresh}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Character */}
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-3">Add Character</h4>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={newCharacter.name || ""}
            onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Character name"
          />
          <input
            type="text"
            value={newCharacter.vocabulary?.join(", ") || ""}
            onChange={(e) => setNewCharacter({ ...newCharacter, vocabulary: e.target.value.split(",").map(v => v.trim()).filter(Boolean) })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Vocabulary words (comma-separated)"
          />
        </div>
        <button
          onClick={addCharacter}
          disabled={!newCharacter.name}
          className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
        >
          Add Character
        </button>
        <p className="mt-2 text-xs text-gray-500">
          After adding a character, click &quot;Images&quot; to upload artwork.
        </p>
      </div>
    </div>
  );
}

function FeedbackTab({
  theme,
  onChange,
  onRegenerateAudio
}: {
  theme: ThemeWithDetails;
  onChange: (updates: Partial<ThemeWithDetails>) => void;
  onRegenerateAudio: () => Promise<void>;
}) {
  const phrases = theme.feedbackPhrases || { correct: [], encourage: [], celebrate: [] };
  const [isRegenerating, setIsRegenerating] = useState(false);

  const updatePhrases = (type: keyof FeedbackPhrases, newPhrases: string[]) => {
    onChange({
      feedbackPhrases: { ...phrases, [type]: newPhrases },
    });
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerateAudio();
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Voice phrases played during gameplay. Edit phrases and regenerate audio.
        </p>
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
        >
          {isRegenerating ? "Regenerating..." : "Regenerate Audio"}
        </button>
      </div>

      {/* Correct Phrases */}
      <div>
        <h4 className="font-medium text-green-700 mb-2">Correct Answers</h4>
        <div className="space-y-2">
          {phrases.correct?.map((phrase, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={phrase}
                onChange={(e) => {
                  const updated = [...(phrases.correct || [])];
                  updated[i] = e.target.value;
                  updatePhrases("correct", updated);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => updatePhrases("correct", phrases.correct?.filter((_, j) => j !== i) || [])}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => updatePhrases("correct", [...(phrases.correct || []), ""])}
            className="text-sm text-green-600 hover:underline"
          >
            + Add phrase
          </button>
        </div>
      </div>

      {/* Encourage Phrases */}
      <div>
        <h4 className="font-medium text-amber-700 mb-2">Encouragement</h4>
        <div className="space-y-2">
          {phrases.encourage?.map((phrase, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={phrase}
                onChange={(e) => {
                  const updated = [...(phrases.encourage || [])];
                  updated[i] = e.target.value;
                  updatePhrases("encourage", updated);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => updatePhrases("encourage", phrases.encourage?.filter((_, j) => j !== i) || [])}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => updatePhrases("encourage", [...(phrases.encourage || []), ""])}
            className="text-sm text-amber-600 hover:underline"
          >
            + Add phrase
          </button>
        </div>
      </div>

      {/* Celebrate Phrases */}
      <div>
        <h4 className="font-medium text-blue-700 mb-2">Celebration</h4>
        <div className="space-y-2">
          {phrases.celebrate?.map((phrase, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={phrase}
                onChange={(e) => {
                  const updated = [...(phrases.celebrate || [])];
                  updated[i] = e.target.value;
                  updatePhrases("celebrate", updated);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => updatePhrases("celebrate", phrases.celebrate?.filter((_, j) => j !== i) || [])}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => updatePhrases("celebrate", [...(phrases.celebrate || []), ""])}
            className="text-sm text-blue-600 hover:underline"
          >
            + Add phrase
          </button>
        </div>
      </div>
    </div>
  );
}

function AssetsTab({
  theme,
  onRefresh,
}: {
  theme: ThemeWithDetails;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Upload theme artwork directly. Images are automatically saved to the cloud and linked to this theme.
      </p>
      <ThemeArtworkGrid
        themeId={theme.id}
        themeName={theme.displayName}
        assets={theme.assets}
        onUpdate={onRefresh}
      />
    </div>
  );
}

function CampaignsTab({
  theme,
  onDelete,
}: {
  theme: ThemeWithDetails;
  onDelete: (campaignId: string) => void;
}) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newCampaign, setNewCampaign] = useState({ title: "", synopsis: "" });

  const handleCreate = async () => {
    if (!newCampaign.title) return;
    setIsCreating(true);

    try {
      const response = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newCampaign.title,
          synopsis: newCampaign.synopsis,
          themeId: theme.id,
          missions: [],
        }),
      });

      if (!response.ok) throw new Error("Failed to create campaign");

      const data = await response.json();
      router.push(`/admin/campaigns/${data.campaign.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create campaign");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (campaignId: string, title: string) => {
    if (!confirm(`Delete campaign "${title}"? This will remove its missions and unassign sentences.`)) {
      return;
    }

    setDeletingId(campaignId);

    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete campaign");
      }

      onDelete(campaignId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete campaign");
    } finally {
      setDeletingId(null);
    }
  };

  const campaigns = theme.campaigns || [];

  return (
    <div className="space-y-6">
      {/* Campaign List */}
      {campaigns.length > 0 ? (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{campaign.title}</h4>
                  {campaign.synopsis && (
                    <p className="text-sm text-gray-500 mt-1">{campaign.synopsis}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {campaign.missions?.length || 0} missions
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/campaigns/${campaign.id}`}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
                  >
                    Manage
                  </Link>
                  <button
                    onClick={() => handleDelete(campaign.id, campaign.title)}
                    disabled={deletingId === campaign.id}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50"
                  >
                    {deletingId === campaign.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No campaigns yet</p>
        </div>
      )}

      {/* Create Campaign */}
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-3">Add Campaign</h4>
        <div className="space-y-3">
          <input
            type="text"
            value={newCampaign.title}
            onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Campaign title"
          />
          <textarea
            value={newCampaign.synopsis}
            onChange={(e) => setNewCampaign({ ...newCampaign, synopsis: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Campaign synopsis (optional)"
            rows={2}
          />
          <button
            onClick={handleCreate}
            disabled={!newCampaign.title || isCreating}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
          >
            {isCreating ? "Creating..." : "Create Campaign"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ThemeEditorPage({ themeId }: { themeId: string }) {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<Tab>("general");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const response = await fetch(`/api/admin/themes/${themeId}`);
        if (!response.ok) throw new Error("Failed to load theme");
        const data = await response.json();
        setTheme(data.theme);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }
    loadTheme();
  }, [themeId]);

  const handleChange = useCallback((updates: Partial<ThemeWithDetails>) => {
    setTheme((prev) => (prev ? { ...prev, ...updates } : null));
    setHasChanges(true);
  }, []);

  const handleCampaignDeleted = useCallback((campaignId: string) => {
    setTheme((prev) => {
      if (!prev) return prev;
      const campaigns = prev.campaigns?.filter((c) => c.id !== campaignId);
      return { ...prev, campaigns };
    });
  }, []);

  const refreshTheme = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/themes/${themeId}`);
      if (!response.ok) throw new Error("Failed to load theme");
      const data = await response.json();
      setTheme(data.theme);
    } catch (err) {
      console.error("Failed to refresh theme:", err);
    }
  }, [themeId]);

  const handleSave = async () => {
    if (!theme) return;
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/themes/${themeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: theme.name,
          displayName: theme.displayName,
          palette: theme.palette,
          characters: theme.characters,
          feedbackPhrases: theme.feedbackPhrases,
          assets: theme.assets,
          isActive: theme.isActive,
          isCustom: theme.isCustom,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save theme");
      }

      setHasChanges(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save theme");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateAudio = async () => {
    if (!theme) return;

    try {
      const response = await fetch(`/api/admin/themes/${themeId}/regenerate-audio`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to regenerate audio");
      }

      alert("Audio regeneration started. This may take a few moments.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to regenerate audio");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !theme) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error: {error || "Theme not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/themes"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            ← Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{theme.displayName}</h1>
            <p className="text-sm text-gray-500">{theme.name}</p>
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

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex gap-2 p-4 border-b border-gray-200 bg-gray-50">
          <TabButton tab="general" current={currentTab} onClick={setCurrentTab}>General</TabButton>
          <TabButton tab="palette" current={currentTab} onClick={setCurrentTab}>Palette</TabButton>
          <TabButton tab="characters" current={currentTab} onClick={setCurrentTab}>Characters</TabButton>
          <TabButton tab="feedback" current={currentTab} onClick={setCurrentTab}>Feedback</TabButton>
          <TabButton tab="assets" current={currentTab} onClick={setCurrentTab}>Assets</TabButton>
          <TabButton tab="campaigns" current={currentTab} onClick={setCurrentTab}>Campaigns</TabButton>
        </div>

        <div className="p-6">
          {currentTab === "general" && <GeneralTab theme={theme} onChange={handleChange} />}
          {currentTab === "palette" && <PaletteTab theme={theme} onChange={handleChange} />}
          {currentTab === "characters" && <CharactersTab theme={theme} onChange={handleChange} onRefresh={refreshTheme} />}
          {currentTab === "feedback" && <FeedbackTab theme={theme} onChange={handleChange} onRegenerateAudio={handleRegenerateAudio} />}
          {currentTab === "assets" && <AssetsTab theme={theme} onRefresh={refreshTheme} />}
          {currentTab === "campaigns" && <CampaignsTab theme={theme} onDelete={handleCampaignDeleted} />}
        </div>
      </div>
    </div>
  );
}
