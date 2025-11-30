"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Theme, Campaign } from "@/lib/db/schema";

type GeneratorMode = "sentences" | "campaign" | null;

interface GeneratedSentence {
  text: string;
  orderedWords: string[];
  distractors: string[];
  newWords: string[];
}

interface GeneratedCampaign {
  title: string;
  synopsis: string;
  theme: {
    name: string;
    displayName: string;
    palette: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      cardBackground: string;
      text: string;
      success: string;
    };
  };
  characters: {
    id: string;
    name: string;
    description: string;
  }[];
  missions: {
    title: string;
    type: string;
    narrativeIntro: string;
    narrativeOutro: string;
    sentences: GeneratedSentence[];
  }[];
}

const WORD_LEVELS = [
  { value: "pre-primer", label: "Pre-Primer" },
  { value: "primer", label: "Primer" },
  { value: "first-grade", label: "First Grade" },
  { value: "mixed", label: "Mixed" },
];

interface GeneratorPageProps {
  themes: Theme[];
  existingWords: string[];
  campaigns: Campaign[];
}

export function GeneratorPage({
  themes,
  existingWords,
  campaigns,
}: GeneratorPageProps) {
  const [activeMode, setActiveMode] = useState<GeneratorMode>(null);

  // Sentence Generator State
  const [sentenceForm, setSentenceForm] = useState({
    topic: "",
    level: "pre-primer",
    count: 5,
    themeId: "",
  });
  const [generatedSentences, setGeneratedSentences] = useState<GeneratedSentence[] | null>(null);

  // Campaign Generator State
  const [campaignForm, setCampaignForm] = useState({
    themeName: "",
    storyIdea: "",
    level: "pre-primer",
    missionCount: 10,
    characters: "",
  });
  const [generatedCampaign, setGeneratedCampaign] = useState<GeneratedCampaign | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Generate Sentences
  const handleGenerateSentences = useCallback(async () => {
    if (!sentenceForm.topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress("Generating sentences...");
    setGeneratedSentences(null);

    try {
      const response = await fetch("/api/ai/generate-sentences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: sentenceForm.topic.trim(),
          level: sentenceForm.level,
          count: sentenceForm.count,
          existingWords,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate sentences");
      }

      const data = await response.json();
      setGeneratedSentences(data.sentences);
      setProgress(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate sentences");
      setProgress(null);
    } finally {
      setIsGenerating(false);
    }
  }, [sentenceForm, existingWords]);

  // Generate Campaign
  const handleGenerateCampaign = useCallback(async () => {
    if (!campaignForm.themeName.trim()) {
      setError("Please enter a theme name");
      return;
    }
    if (!campaignForm.storyIdea.trim()) {
      setError("Please describe the story idea");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress("Creating story arc...");
    setGeneratedCampaign(null);

    try {
      const response = await fetch("/api/ai/generate-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeName: campaignForm.themeName.trim(),
          storyIdea: campaignForm.storyIdea.trim(),
          level: campaignForm.level,
          missionCount: campaignForm.missionCount,
          characters: campaignForm.characters
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
          existingWords,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate campaign");
      }

      const data = await response.json();
      setGeneratedCampaign(data.campaign);
      setProgress(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate campaign");
      setProgress(null);
    } finally {
      setIsGenerating(false);
    }
  }, [campaignForm, existingWords]);

  // Save Generated Sentences
  const handleSaveSentences = useCallback(async () => {
    if (!generatedSentences) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Save each sentence
      for (const sentence of generatedSentences) {
        const response = await fetch("/api/admin/sentences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: sentence.text,
            orderedWords: sentence.orderedWords,
            distractors: sentence.distractors,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to save sentence");
        }
      }

      // Save new words if any
      const allNewWords = Array.from(new Set(generatedSentences.flatMap((s) => s.newWords)));
      for (const word of allNewWords) {
        await fetch("/api/admin/words", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: word, level: "generated" }),
        }).catch(() => {}); // Ignore if word already exists
      }

      setSaveSuccess(`Saved ${generatedSentences.length} sentences!`);
      setTimeout(() => setSaveSuccess(null), 3000);
      setGeneratedSentences(null);
      setActiveMode(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save sentences");
    } finally {
      setIsGenerating(false);
    }
  }, [generatedSentences]);

  // Save Generated Campaign
  const handleSaveCampaign = useCallback(async () => {
    if (!generatedCampaign) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generatedCampaign),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save campaign");
      }

      setSaveSuccess(`Campaign "${generatedCampaign.title}" saved!`);
      setTimeout(() => setSaveSuccess(null), 3000);
      setGeneratedCampaign(null);
      setActiveMode(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save campaign");
    } finally {
      setIsGenerating(false);
    }
  }, [generatedCampaign]);

  const removeSentence = (index: number) => {
    setGeneratedSentences((prev) => prev?.filter((_, i) => i !== index) || null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Content Generator</h1>
        <p className="text-gray-500 mt-1">
          Create custom learning content powered by AI
        </p>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800"
          >
            {saveSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Selection */}
      {!activeMode && !generatedSentences && !generatedCampaign && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Magic Level Creator */}
          <button
            onClick={() => setActiveMode("sentences")}
            className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 text-white text-left hover:shadow-lg transition group"
          >
            <div className="text-4xl mb-4">✨</div>
            <h2 className="text-xl font-bold mb-2">Magic Level Creator</h2>
            <p className="text-purple-100">
              Generate new sentences from any topic. Perfect for creating practice
              levels tailored to your child&apos;s interests.
            </p>
            <div className="mt-4 flex items-center gap-2 text-purple-200 group-hover:text-white transition">
              <span>Get Started</span>
              <span>→</span>
            </div>
          </button>

          {/* Story Generator */}
          <button
            onClick={() => setActiveMode("campaign")}
            className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-8 text-white text-left hover:shadow-lg transition group"
          >
            <div className="text-4xl mb-4">📖</div>
            <h2 className="text-xl font-bold mb-2">Story Generator</h2>
            <p className="text-amber-100">
              Create a complete adventure with storyline, characters, and missions.
              Generate an entire custom theme!
            </p>
            <div className="mt-4 flex items-center gap-2 text-amber-200 group-hover:text-white transition">
              <span>Get Started</span>
              <span>→</span>
            </div>
          </button>
        </div>
      )}

      {/* Sentence Generator Form */}
      {activeMode === "sentences" && !generatedSentences && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">✨ Magic Level Creator</h2>
            <button
              onClick={() => setActiveMode(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕ Close
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What topic should we use?
              </label>
              <textarea
                value={sentenceForm.topic}
                onChange={(e) =>
                  setSentenceForm((f) => ({ ...f, topic: e.target.value }))
                }
                placeholder="My kid loves dinosaurs. They especially like T-Rex and want to discover fossils..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Word Level
                </label>
                <select
                  value={sentenceForm.level}
                  onChange={(e) =>
                    setSentenceForm((f) => ({ ...f, level: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white"
                >
                  {WORD_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Sentences
                </label>
                <select
                  value={sentenceForm.count}
                  onChange={(e) =>
                    setSentenceForm((f) => ({ ...f, count: parseInt(e.target.value) }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white"
                >
                  {[3, 4, 5, 6, 8, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} sentences
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                {error}
              </div>
            )}

            {progress && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl flex items-center gap-3">
                <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
                {progress}
              </div>
            )}

            <button
              onClick={handleGenerateSentences}
              disabled={isGenerating}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              <span>✨</span>
              {isGenerating ? "Generating..." : "Generate Sentences"}
            </button>
          </div>
        </motion.div>
      )}

      {/* Generated Sentences Preview */}
      {generatedSentences && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Generated Sentences</h2>
            <button
              onClick={() => {
                setGeneratedSentences(null);
                setActiveMode(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕ Close
            </button>
          </div>

          <div className="space-y-4 mb-6">
            {generatedSentences.map((sentence, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-lg font-medium text-gray-900">
                      {index + 1}. &ldquo;{sentence.text}&rdquo;
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {sentence.orderedWords.map((word, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded"
                        >
                          {word}
                        </span>
                      ))}
                      {sentence.distractors.map((word, i) => (
                        <span
                          key={`d-${i}`}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                    {sentence.newWords.length > 0 && (
                      <p className="text-xs text-amber-600 mt-2">
                        New words: {sentence.newWords.join(", ")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeSentence(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleGenerateSentences}
              disabled={isGenerating}
              className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Regenerate All
            </button>
            <button
              onClick={handleSaveSentences}
              disabled={isGenerating || generatedSentences.length === 0}
              className="flex-1 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {isGenerating ? "Saving..." : "Save to Library"}
            </button>
          </div>
        </motion.div>
      )}

      {/* Campaign Generator Form */}
      {activeMode === "campaign" && !generatedCampaign && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">📖 Story Generator</h2>
            <button
              onClick={() => setActiveMode(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕ Close
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme Name
              </label>
              <input
                type="text"
                value={campaignForm.themeName}
                onChange={(e) =>
                  setCampaignForm((f) => ({ ...f, themeName: e.target.value }))
                }
                placeholder="Dinosaur Discovery"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What&apos;s the story about?
              </label>
              <textarea
                value={campaignForm.storyIdea}
                onChange={(e) =>
                  setCampaignForm((f) => ({ ...f, storyIdea: e.target.value }))
                }
                placeholder="A young paleontologist discovers a hidden valley where dinosaurs still live. They need to learn dinosaur language (sentences) to make friends with each dinosaur species..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Word Level
                </label>
                <select
                  value={campaignForm.level}
                  onChange={(e) =>
                    setCampaignForm((f) => ({ ...f, level: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white"
                >
                  {WORD_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Missions
                </label>
                <select
                  value={campaignForm.missionCount}
                  onChange={(e) =>
                    setCampaignForm((f) => ({
                      ...f,
                      missionCount: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white"
                >
                  {[5, 8, 10, 12, 15].map((n) => (
                    <option key={n} value={n}>
                      {n} missions
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Character Names (optional, comma-separated)
              </label>
              <input
                type="text"
                value={campaignForm.characters}
                onChange={(e) =>
                  setCampaignForm((f) => ({ ...f, characters: e.target.value }))
                }
                placeholder="Rex, Trina, Petra"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                {error}
              </div>
            )}

            {progress && (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl flex items-center gap-3">
                <div className="animate-spin h-5 w-5 border-2 border-amber-600 border-t-transparent rounded-full" />
                {progress}
              </div>
            )}

            <button
              onClick={handleGenerateCampaign}
              disabled={isGenerating}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              <span>✨</span>
              {isGenerating ? "Generating Campaign..." : "Generate Full Campaign"}
            </button>

            <p className="text-center text-sm text-gray-500">
              This may take 30-60 seconds to generate
            </p>
          </div>
        </motion.div>
      )}

      {/* Generated Campaign Preview */}
      {generatedCampaign && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          {/* Campaign Header */}
          <div
            className="p-8 text-white"
            style={{ backgroundColor: generatedCampaign.theme.palette.primary }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{generatedCampaign.title}</h2>
              <button
                onClick={() => {
                  setGeneratedCampaign(null);
                  setActiveMode(null);
                }}
                className="text-white/80 hover:text-white"
              >
                ✕ Close
              </button>
            </div>
            <p className="text-white/90">{generatedCampaign.synopsis}</p>

            {/* Color Palette */}
            <div className="flex gap-2 mt-4">
              {Object.entries(generatedCampaign.theme.palette).map(([key, color]) => (
                <div
                  key={key}
                  className="w-8 h-8 rounded-full border-2 border-white/30"
                  style={{ backgroundColor: color }}
                  title={key}
                />
              ))}
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Characters */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Characters</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {generatedCampaign.characters.map((char) => (
                  <div
                    key={char.id}
                    className="bg-gray-50 rounded-xl p-4 text-center"
                  >
                    <div className="text-3xl mb-2">🦖</div>
                    <p className="font-medium text-gray-900">{char.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{char.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Missions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Missions ({generatedCampaign.missions.length})
              </h3>
              <div className="space-y-3">
                {generatedCampaign.missions.slice(0, 5).map((mission, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{
                          backgroundColor: generatedCampaign.theme.palette.primary,
                        }}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900">{mission.title}</h4>
                        <span className="text-xs text-gray-500 uppercase">
                          {mission.type}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {mission.narrativeIntro}
                    </p>
                    <p className="text-xs text-gray-500">
                      {mission.sentences.length} sentences
                    </p>
                  </div>
                ))}
                {generatedCampaign.missions.length > 5 && (
                  <p className="text-center text-sm text-gray-500">
                    +{generatedCampaign.missions.length - 5} more missions
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleGenerateCampaign}
                disabled={isGenerating}
                className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Regenerate
              </button>
              <button
                onClick={handleSaveCampaign}
                disabled={isGenerating}
                className="flex-1 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {isGenerating ? "Saving..." : "Save Campaign"}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Existing Content Summary */}
      {!activeMode && !generatedSentences && !generatedCampaign && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Word Bank</h3>
            <p className="text-3xl font-bold text-indigo-600">{existingWords.length}</p>
            <p className="text-sm text-gray-500">words available</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Active Themes</h3>
            <p className="text-3xl font-bold text-purple-600">{themes.length}</p>
            <p className="text-sm text-gray-500">themes in library</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Campaigns</h3>
            <p className="text-3xl font-bold text-amber-600">{campaigns.length}</p>
            <p className="text-sm text-gray-500">campaigns created</p>
          </div>
        </div>
      )}
    </div>
  );
}
