"use client";

import { useState } from "react";
import Link from "next/link";
import type { Word, Sentence } from "@/lib/db/schema";
import { ThemeViewer } from "@/components/admin/ThemeViewer";

type Tab = "words" | "sentences" | "themes";

interface AdminClientProps {
  initialWords: Word[];
  initialSentences: Sentence[];
}

export default function AdminClient({ initialWords, initialSentences }: AdminClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("words");
  const [wordsList, setWordsList] = useState<Word[]>(initialWords);
  const [sentencesList, setSentencesList] = useState<Sentence[]>(initialSentences);

  // Word form state
  const [newWord, setNewWord] = useState("");
  const [wordLevel, setWordLevel] = useState("custom");
  const [wordLoading, setWordLoading] = useState(false);
  const [wordError, setWordError] = useState("");
  const [wordSuccess, setWordSuccess] = useState("");

  // Sentence form state
  const [newSentence, setNewSentence] = useState("");
  const [distractors, setDistractors] = useState("");
  const [sentenceLoading, setSentenceLoading] = useState(false);
  const [sentenceError, setSentenceError] = useState("");
  const [sentenceSuccess, setSentenceSuccess] = useState("");

  // Sync audio state
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    totalBlobFiles: number;
    alreadyInDb: number;
    newlyAdded: number;
    errors: string[];
    addedWords: string[];
  } | null>(null);

  // Add word handler
  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    setWordError("");
    setWordSuccess("");
    setWordLoading(true);

    try {
      const response = await fetch("/api/admin/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newWord, level: wordLevel }),
      });

      const data = await response.json();

      if (!response.ok) {
        setWordError(data.error || "Failed to add word");
        return;
      }

      setWordsList(prev => [...prev, data.word].sort((a, b) => a.text.localeCompare(b.text)));
      setNewWord("");
      setWordSuccess(`Added "${data.word.text}"`);
    } catch {
      setWordError("Network error. Please try again.");
    } finally {
      setWordLoading(false);
    }
  };

  // Delete word handler
  const handleDeleteWord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this word?")) return;

    try {
      const response = await fetch(`/api/admin/words/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to delete word");
        return;
      }

      setWordsList(prev => prev.filter(w => w.id !== id));
    } catch {
      alert("Network error. Please try again.");
    }
  };

  // Add sentence handler
  const handleAddSentence = async (e: React.FormEvent) => {
    e.preventDefault();
    setSentenceError("");
    setSentenceSuccess("");
    setSentenceLoading(true);

    try {
      const distractorList = distractors
        .split(",")
        .map(d => d.trim().toLowerCase())
        .filter(d => d.length > 0);

      const response = await fetch("/api/admin/sentences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newSentence,
          distractors: distractorList,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.missingWords) {
          setSentenceError(`Missing words: ${data.missingWords.join(", ")}`);
        } else {
          setSentenceError(data.error || "Failed to add sentence");
        }
        return;
      }

      setSentencesList(prev => [data.sentence, ...prev]);
      setNewSentence("");
      setDistractors("");
      setSentenceSuccess("Sentence added successfully!");
    } catch {
      setSentenceError("Network error. Please try again.");
    } finally {
      setSentenceLoading(false);
    }
  };

  // Delete sentence handler
  const handleDeleteSentence = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sentence?")) return;

    try {
      const response = await fetch(`/api/admin/sentences/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to delete sentence");
        return;
      }

      setSentencesList(prev => prev.filter(s => s.id !== id));
    } catch {
      alert("Network error. Please try again.");
    }
  };

  // Sync audio handler - scans blob storage and adds missing words to DB
  const handleSyncAudio = async () => {
    setSyncLoading(true);
    setSyncResult(null);

    try {
      const response = await fetch("/api/admin/sync-audio", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to sync audio");
        return;
      }

      setSyncResult(data);

      // Refresh word list if new words were added
      if (data.newlyAdded > 0) {
        const wordsResponse = await fetch("/api/admin/words");
        const wordsData = await wordsResponse.json();
        if (wordsData.words) {
          setWordsList(wordsData.words);
        }
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("words")}
            className={`px-6 py-2 rounded-md font-medium transition ${
              activeTab === "words"
                ? "bg-white text-indigo-600 shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Words ({wordsList.length})
          </button>
          <button
            onClick={() => setActiveTab("sentences")}
            className={`px-6 py-2 rounded-md font-medium transition ${
              activeTab === "sentences"
                ? "bg-white text-indigo-600 shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Sentences ({sentencesList.length})
          </button>
          <button
            onClick={() => setActiveTab("themes")}
            className={`px-6 py-2 rounded-md font-medium transition ${
              activeTab === "themes"
                ? "bg-white text-indigo-600 shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Themes
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "words" && (
          <div className="space-y-6">
            {/* Add Word Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Word</h2>
              <form onSubmit={handleAddWord} className="flex flex-wrap gap-4">
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="Enter word..."
                  className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <select
                  value={wordLevel}
                  onChange={(e) => setWordLevel(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="pre-primer">Pre-Primer</option>
                  <option value="primer">Primer</option>
                  <option value="first-grade">First Grade</option>
                  <option value="second-grade">Second Grade</option>
                  <option value="third-grade">Third Grade</option>
                  <option value="custom">Custom</option>
                </select>
                <button
                  type="submit"
                  disabled={wordLoading || !newWord.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {wordLoading ? "Adding..." : "Add Word"}
                </button>
              </form>
              {wordError && (
                <p className="mt-2 text-red-600 text-sm">{wordError}</p>
              )}
              {wordSuccess && (
                <p className="mt-2 text-green-600 text-sm">{wordSuccess}</p>
              )}
            </div>

            {/* Sync Audio Panel */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Sync Generated Audio</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Scan blob storage for audio files created on-demand and add them to the database
                  </p>
                </div>
                <button
                  onClick={handleSyncAudio}
                  disabled={syncLoading}
                  className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {syncLoading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Syncing...
                    </>
                  ) : (
                    <>
                      <span>🔄</span>
                      Sync Audio
                    </>
                  )}
                </button>
              </div>

              {syncResult && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center mb-4">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{syncResult.totalBlobFiles}</div>
                      <div className="text-xs text-gray-500">Audio Files in Blob</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{syncResult.alreadyInDb}</div>
                      <div className="text-xs text-gray-500">Already in Database</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">{syncResult.newlyAdded}</div>
                      <div className="text-xs text-gray-500">Newly Added</div>
                    </div>
                  </div>

                  {syncResult.addedWords.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">Added words:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {syncResult.addedWords.map((word, i) => (
                          <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {syncResult.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-red-700">Errors:</p>
                      <ul className="text-xs text-red-600 mt-1 list-disc list-inside">
                        {syncResult.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Words List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Word Bank</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Word
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level / Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Audio
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {wordsList.map((word) => (
                      <tr key={word.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {word.text}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            word.level === "pre-primer" ? "bg-green-100 text-green-800" :
                            word.level === "primer" ? "bg-blue-100 text-blue-800" :
                            word.level === "first-grade" ? "bg-indigo-100 text-indigo-800" :
                            word.level === "generated" ? "bg-amber-100 text-amber-800" :
                            word.level === "custom" ? "bg-purple-100 text-purple-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {word.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {word.audioUrl ? (
                            <span className="text-green-600">✓ Has Audio</span>
                          ) : (
                            <span className="text-yellow-600">⚠ Missing</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDeleteWord(word.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {wordsList.length === 0 && (
                <p className="px-6 py-8 text-center text-gray-500">
                  No words yet. Add your first word above!
                </p>
              )}
            </div>
          </div>
        )}
        {activeTab === "sentences" && (
          <div className="space-y-6">
            {/* Add Sentence Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Sentence</h2>
              <form onSubmit={handleAddSentence} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sentence Text
                  </label>
                  <input
                    type="text"
                    value={newSentence}
                    onChange={(e) => setNewSentence(e.target.value)}
                    placeholder="e.g., The cat can run."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    All words must exist in the word bank
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distractors (optional)
                  </label>
                  <input
                    type="text"
                    value={distractors}
                    onChange={(e) => setDistractors(e.target.value)}
                    placeholder="e.g., dog, big, see (comma separated)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Extra words shown but not needed for the sentence
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={sentenceLoading || !newSentence.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {sentenceLoading ? "Adding..." : "Add Sentence"}
                </button>
              </form>
              {sentenceError && (
                <p className="mt-2 text-red-600 text-sm">{sentenceError}</p>
              )}
              {sentenceSuccess && (
                <p className="mt-2 text-green-600 text-sm">{sentenceSuccess}</p>
              )}
            </div>

            {/* Sentences List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Sentence Bank</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {sentencesList.map((sentence) => (
                  <div key={sentence.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-lg">
                          &quot;{sentence.text}&quot;
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <span className="text-xs text-gray-500">
                            Words: {(sentence.orderedWords as string[]).join(" → ")}
                          </span>
                          {sentence.distractors && (sentence.distractors as string[]).length > 0 && (
                            <span className="text-xs text-orange-600">
                              Distractors: {(sentence.distractors as string[]).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSentence(sentence.id)}
                        className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {sentencesList.length === 0 && (
                <p className="px-6 py-8 text-center text-gray-500">
                  No sentences yet. Add your first sentence above!
                </p>
              )}
            </div>
          </div>
        )}
        {activeTab === "themes" && (
          <ThemeViewer />
        )}
      </main>
    </div>
  );
}
