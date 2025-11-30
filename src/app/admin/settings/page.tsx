"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface AppSettings {
  ttsVoice: string;
  speechSpeed: number;
  sentenceGeneratorModel: string;
  validationModel: string;
  campaignGeneratorModel: string;
}

const TTS_VOICES = [
  { value: "nova", label: "Nova (Default)" },
  { value: "alloy", label: "Alloy" },
  { value: "echo", label: "Echo" },
  { value: "fable", label: "Fable" },
  { value: "onyx", label: "Onyx" },
  { value: "shimmer", label: "Shimmer" },
];

const AI_MODELS = [
  { value: "gpt-4o", label: "GPT-4o (Recommended)" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini (Faster)" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    ttsVoice: "nova",
    speechSpeed: 0.9,
    sentenceGeneratorModel: "gpt-4o",
    validationModel: "gpt-4o-mini",
    campaignGeneratorModel: "gpt-4o",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TTS Voice
            </label>
            <select
              value={settings.ttsVoice}
              onChange={(e) => setSettings((s) => ({ ...s, ttsVoice: e.target.value }))}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {TTS_VOICES.map((voice) => (
                <option key={voice.value} value={voice.value}>
                  {voice.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Voice used for text-to-speech generation
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
