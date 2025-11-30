"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface AppSettings {
  speechSpeed: number;
  sentenceGeneratorModel: string;
  validationModel: string;
  campaignGeneratorModel: string;
}

interface OrphanedBlob {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  type: "audio" | "emoji" | "unknown";
}

interface BlobStats {
  totalBlobs: number;
  referencedCount: number;
  orphanedCount: number;
  orphanedSize: number;
  orphanedBlobs: OrphanedBlob[];
  hasMore: boolean;
}

const AI_MODELS = [
  { value: "gpt-4o", label: "GPT-4o (Recommended)" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini (Faster)" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    speechSpeed: 0.9,
    sentenceGeneratorModel: "gpt-4o",
    validationModel: "gpt-4o-mini",
    campaignGeneratorModel: "gpt-4o",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Blob cleanup state
  const [blobStats, setBlobStats] = useState<BlobStats | null>(null);
  const [isLoadingBlobs, setIsLoadingBlobs] = useState(false);
  const [isDeletingBlobs, setIsDeletingBlobs] = useState(false);
  const [blobMessage, setBlobMessage] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/admin/settings");
        if (response.ok) {
          const data = await response.json();
          setSettings(data.settings);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Save settings
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  // Export all data
  const handleExportAll = useCallback(async () => {
    window.open("/api/admin/export?format=json&type=all", "_blank");
  }, []);

  // Export words
  const handleExportWords = useCallback(async () => {
    window.open("/api/admin/export?format=csv&type=words", "_blank");
  }, []);

  // Reset progress (with confirmation)
  const handleResetProgress = useCallback(async () => {
    if (!confirm("Are you sure you want to reset ALL player progress? This cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch("/api/admin/reset-progress", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to reset progress");
      }

      alert("All progress has been reset.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset progress");
    }
  }, []);

  // Scan for orphaned blobs
  const handleScanBlobs = useCallback(async () => {
    setIsLoadingBlobs(true);
    setBlobMessage(null);

    try {
      const response = await fetch("/api/admin/cleanup-blobs");
      if (!response.ok) {
        throw new Error("Failed to scan blobs");
      }
      const data = await response.json();
      setBlobStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan blobs");
    } finally {
      setIsLoadingBlobs(false);
    }
  }, []);

  // Delete all orphaned blobs
  const handleDeleteOrphanedBlobs = useCallback(async () => {
    if (!blobStats || blobStats.orphanedCount === 0) return;

    if (!confirm(`Are you sure you want to delete ${blobStats.orphanedCount} orphaned blob(s)? This cannot be undone.`)) {
      return;
    }

    setIsDeletingBlobs(true);
    setBlobMessage(null);

    try {
      const response = await fetch("/api/admin/cleanup-blobs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteAll: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete blobs");
      }

      const data = await response.json();
      setBlobMessage(data.message);
      setBlobStats(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete blobs");
    } finally {
      setIsDeletingBlobs(false);
    }
  }, [blobStats]);

  // Format bytes to human readable
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">
            Configure application settings and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition flex items-center gap-2"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800"
        >
          Settings saved successfully!
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Audio Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Audio Settings
        </h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🔊</span>
              <h3 className="font-medium text-gray-900">TTS Voice: Coral</h3>
            </div>
            <p className="text-sm text-gray-500">
              Audio uses OpenAI&apos;s &quot;coral&quot; voice with gpt-4o-mini-tts model, optimized for clear pronunciation for young learners.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speech Speed: {settings.speechSpeed}x
            </label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={settings.speechSpeed}
              onChange={(e) =>
                setSettings((s) => ({ ...s, speechSpeed: parseFloat(e.target.value) }))
              }
              className="w-full md:w-64"
            />
            <p className="text-xs text-gray-500 mt-1">
              0.9x is recommended for young learners
            </p>
          </div>
        </div>
      </div>

      {/* AI Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sentence Generation Model
            </label>
            <select
              value={settings.sentenceGeneratorModel}
              onChange={(e) =>
                setSettings((s) => ({ ...s, sentenceGeneratorModel: e.target.value }))
              }
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {AI_MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Validation Model
            </label>
            <select
              value={settings.validationModel}
              onChange={(e) =>
                setSettings((s) => ({ ...s, validationModel: e.target.value }))
              }
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {AI_MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              GPT-4o Mini is recommended for faster validation
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Generation Model
            </label>
            <select
              value={settings.campaignGeneratorModel}
              onChange={(e) =>
                setSettings((s) => ({ ...s, campaignGeneratorModel: e.target.value }))
              }
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {AI_MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Data Management
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Export All Data</h3>
              <p className="text-sm text-gray-500">
                Download all progress and content as JSON
              </p>
            </div>
            <button
              onClick={handleExportAll}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              Export JSON
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Export Words</h3>
              <p className="text-sm text-gray-500">
                Download word list as CSV spreadsheet
              </p>
            </div>
            <button
              onClick={handleExportWords}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition"
            >
              Export CSV
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <h3 className="font-medium text-red-900">Reset All Progress</h3>
              <p className="text-sm text-red-600">
                This will delete all player progress. Cannot be undone.
              </p>
            </div>
            <button
              onClick={handleResetProgress}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Storage Management */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Storage Management
        </h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-gray-900">Cleanup Orphaned Files</h3>
                <p className="text-sm text-gray-500">
                  Scan for audio and image files no longer referenced by any word or theme
                </p>
              </div>
              <button
                onClick={handleScanBlobs}
                disabled={isLoadingBlobs}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {isLoadingBlobs ? "Scanning..." : "Scan"}
              </button>
            </div>

            {/* Blob message */}
            {blobMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-green-800 text-sm"
              >
                {blobMessage}
              </motion.div>
            )}

            {/* Blob stats */}
            {blobStats && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900">
                      {blobStats.totalBlobs}
                    </div>
                    <div className="text-xs text-gray-500">Total Files</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-2xl font-bold text-green-600">
                      {blobStats.referencedCount}
                    </div>
                    <div className="text-xs text-gray-500">In Use</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-2xl font-bold text-amber-600">
                      {blobStats.orphanedCount}
                    </div>
                    <div className="text-xs text-gray-500">Orphaned</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-2xl font-bold text-amber-600">
                      {formatBytes(blobStats.orphanedSize)}
                    </div>
                    <div className="text-xs text-gray-500">Wasted Space</div>
                  </div>
                </div>

                {blobStats.orphanedCount > 0 && (
                  <>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                        Orphaned Files {blobStats.hasMore && `(showing first 100 of ${blobStats.orphanedCount})`}
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="text-left px-4 py-2 text-gray-600">File</th>
                              <th className="text-left px-4 py-2 text-gray-600">Type</th>
                              <th className="text-right px-4 py-2 text-gray-600">Size</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {blobStats.orphanedBlobs.map((blob, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-gray-700 truncate max-w-[200px]">
                                  {blob.pathname}
                                </td>
                                <td className="px-4 py-2">
                                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                    blob.type === "audio"
                                      ? "bg-blue-100 text-blue-700"
                                      : blob.type === "emoji"
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-gray-100 text-gray-700"
                                  }`}>
                                    {blob.type}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-right text-gray-500">
                                  {formatBytes(blob.size)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleDeleteOrphanedBlobs}
                        disabled={isDeletingBlobs}
                        className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                      >
                        {isDeletingBlobs
                          ? "Deleting..."
                          : `Delete ${blobStats.orphanedCount} Orphaned File(s)`}
                      </button>
                    </div>
                  </>
                )}

                {blobStats.orphanedCount === 0 && (
                  <div className="text-center py-4 text-green-600">
                    No orphaned files found. Storage is clean!
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>Sight Words Adventure</strong> v0.3.0
          </p>
          <p>
            An educational game helping kindergarteners learn sight words
            through narrative-driven gameplay.
          </p>
          <p className="text-gray-400 mt-4">
            Built with Next.js, Vercel AI SDK, and OpenAI
          </p>
        </div>
      </div>
    </div>
  );
}
