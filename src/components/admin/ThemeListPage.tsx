"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Theme, Campaign, Mission, Sentence } from "@/lib/db/schema";

interface ThemeWithDetails extends Theme {
  campaigns?: CampaignWithMissions[];
}

interface CampaignWithMissions extends Campaign {
  missions?: MissionWithSentences[];
}

interface MissionWithSentences extends Mission {
  sentences?: Sentence[];
}

function ColorPreview({ palette }: { palette: Theme["palette"] }) {
  if (!palette) return null;

  const colors = [
    palette.primary,
    palette.secondary,
    palette.accent,
    palette.background,
  ];

  return (
    <div className="flex gap-1">
      {colors.map((color, i) => (
        <div
          key={i}
          className="w-4 h-4 rounded-full border border-gray-200"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

function ThemeCard({ theme, onDelete }: { theme: ThemeWithDetails; onDelete: (id: string) => void }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const campaignCount = theme.campaigns?.length || 0;
  const missionCount = theme.campaigns?.reduce(
    (acc, c) => acc + (c.missions?.length || 0),
    0
  ) || 0;
  const sentenceCount = theme.campaigns?.reduce(
    (acc, c) => acc + (c.missions?.reduce((m, mi) => m + (mi.sentences?.length || 0), 0) || 0),
    0
  ) || 0;

  const hasContent = campaignCount > 0;

  const handleDelete = async () => {
    if (!confirm(`Delete theme "${theme.displayName}"? This will also delete all campaigns, missions, and sentences.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/themes/${theme.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete theme");
      }

      onDelete(theme.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete theme");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const response = await fetch("/api/admin/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${theme.name}-copy`,
          displayName: `${theme.displayName} (Copy)`,
          palette: theme.palette,
          assets: theme.assets,
          characters: theme.characters,
          feedbackPhrases: theme.feedbackPhrases,
          isActive: false,
          isCustom: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to duplicate theme");
      }

      const data = await response.json();
      router.push(`/admin/themes/${data.theme.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to duplicate theme");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Theme Header with gradient preview */}
      <div
        className="h-20 relative"
        style={{
          background: theme.palette
            ? `linear-gradient(135deg, ${theme.palette.primary}, ${theme.palette.secondary})`
            : "linear-gradient(135deg, #6366f1, #8b5cf6)"
        }}
      >
        {!theme.isActive && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-gray-800/60 text-white text-xs rounded">
            Inactive
          </span>
        )}
        {theme.isCustom && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-purple-600/80 text-white text-xs rounded">
            Custom
          </span>
        )}
      </div>

      {/* Theme Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{theme.displayName}</h3>
        <p className="text-sm text-gray-500 mb-3">{theme.name}</p>

        <ColorPreview palette={theme.palette} />

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
          <div className="bg-gray-50 rounded py-1.5">
            <div className="font-semibold text-gray-900">{campaignCount}</div>
            <div className="text-xs text-gray-500">Campaigns</div>
          </div>
          <div className="bg-gray-50 rounded py-1.5">
            <div className="font-semibold text-gray-900">{missionCount}</div>
            <div className="text-xs text-gray-500">Missions</div>
          </div>
          <div className="bg-gray-50 rounded py-1.5">
            <div className="font-semibold text-gray-900">{sentenceCount}</div>
            <div className="text-xs text-gray-500">Sentences</div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-3 flex items-center gap-2">
          {hasContent ? (
            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Ready
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              No content
            </span>
          )}

          {theme.characters && theme.characters.length > 0 && (
            <span className="text-xs text-gray-500">
              {theme.characters.length} characters
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Link
            href={`/admin/themes/${theme.id}`}
            className="flex-1 px-3 py-2 text-sm font-medium text-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={handleDuplicate}
            className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Duplicate theme"
          >
            Copy
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Delete theme"
          >
            {isDeleting ? "..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface CreateThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (theme: Theme) => void;
}

function CreateThemeModal({ isOpen, onClose, onCreate }: CreateThemeModalProps) {
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.toLowerCase().replace(/\s+/g, "-"),
          displayName,
          palette: {
            primary: "#3B82F6",
            secondary: "#60A5FA",
            accent: "#F59E0B",
            background: "#F0F9FF",
            cardBackground: "#FFFFFF",
            text: "#1F2937",
            success: "#10B981",
          },
          isActive: true,
          isCustom: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create theme");
      }

      const data = await response.json();
      onCreate(data.theme);
      setName("");
      setDisplayName("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create theme");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create New Theme</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setName(e.target.value.toLowerCase().replace(/\s+/g, "-"));
              }}
              placeholder="My Awesome Theme"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug (auto-generated)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              placeholder="my-awesome-theme"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Lowercase letters, numbers, and hyphens only
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Theme"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ThemeListPage() {
  const router = useRouter();
  const [themes, setThemes] = useState<ThemeWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    async function loadThemes() {
      try {
        const response = await fetch("/api/admin/themes");
        if (!response.ok) throw new Error("Failed to load themes");
        const data = await response.json();
        setThemes(data.themes || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }
    loadThemes();
  }, []);

  const handleDelete = (id: string) => {
    setThemes((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreate = (theme: Theme) => {
    router.push(`/admin/themes/${theme.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Themes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage game themes, campaigns, and visual styles
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          New Theme
        </button>
      </div>

      {/* Theme Grid */}
      {themes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-4xl mb-4">🎨</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No themes yet</h3>
          <p className="text-gray-500 mb-4">
            Create your first theme to get started, or run the seed script.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Theme
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <CreateThemeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
