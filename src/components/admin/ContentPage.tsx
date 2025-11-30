"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Word, Sentence, Theme, Campaign, Mission } from "@/lib/db/schema";
import {
  getWordType,
  getAutoEmoji,
  DEFAULT_WORD_COLORS,
  DOLCH_TYPES,
  NON_SIGHT_TYPES,
  ALL_WORD_TYPES,
} from "@/lib/words/word-types";

type ContentTab = "words" | "sentences" | "themes";

// Extended Word type with computed adventures from API
interface WordWithAdventures extends Word {
  adventures?: Theme[];
}

// Extended Sentence type with computed adventure from API
interface SentenceWithAdventure extends Sentence {
  adventure?: Theme | null;
}

interface CampaignWithRelations extends Campaign {
  theme: Theme | null;
  missions: (Mission & { sentences: Sentence[] })[];
}

interface ContentPageProps {
  words: WordWithAdventures[];
  sentences: SentenceWithAdventure[];
  themes: Theme[];
  campaigns: CampaignWithRelations[];
}

// Word type options for dropdown - organized by category
const WORD_TYPES = [
  // Non-sight word types first (most common for adding)
  { value: "custom", label: "Custom", description: "Theme-specific words, nouns, common words with emoji/picture" },
  { value: "generated", label: "Generated", description: "AI-generated words" },
  // Sight word types (Dolch levels)
  { value: "pre-primer", label: "Pre-Primer", description: "Dolch sight words (40 words)" },
  { value: "primer", label: "Primer", description: "Dolch sight words (52 words)" },
  { value: "first-grade", label: "First Grade", description: "Dolch sight words (41 words)" },
  { value: "second-grade", label: "Second Grade", description: "Dolch sight words (46 words)" },
  { value: "third-grade", label: "Third Grade", description: "Dolch sight words (41 words)" },
];

// Filter options for word list
const WORD_TYPE_FILTERS = [
  { value: "all", label: "All Types" },
  { value: "sight", label: "Sight Words" },
  { value: "character", label: "Character Words" },
  { value: "other", label: "Other Words" },
];

export function ContentPage({
  words: initialWords,
  sentences: initialSentences,
  themes,
  campaigns,
}: ContentPageProps) {
  const [activeTab, setActiveTab] = useState<ContentTab>("words");
  const [words, setWords] = useState(initialWords);
  const [sentences, setSentences] = useState(initialSentences);

  // Filter states
  const [wordSearch, setWordSearch] = useState("");
  const [wordLevelFilter, setWordLevelFilter] = useState("all");
  const [wordTypeFilter, setWordTypeFilter] = useState("all");
  const [sentenceSearch, setSentenceSearch] = useState("");

  // Pagination state
  const [wordPage, setWordPage] = useState(1);
  const [sentencePage, setSentencePage] = useState(1);
  const WORDS_PER_PAGE = 100;
  const SENTENCES_PER_PAGE = 50;

  // Modal states
  const [wordModal, setWordModal] = useState<{ mode: "create" | "edit"; word?: Word } | null>(null);
  const [sentenceModal, setSentenceModal] = useState<{ mode: "create" | "edit"; sentence?: Sentence } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ type: "word" | "sentence"; id: string; text: string } | null>(null);
  const [previewSentence, setPreviewSentence] = useState<Sentence | null>(null);
  const [previewWord, setPreviewWord] = useState<Word | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; word: string } | null>(null);

  // Form states
  const [wordForm, setWordForm] = useState({
    text: "",
    type: "custom",
    isSightWord: false,
    isCharacterWord: false,
    emoji: "",
    imageUrl: "",
  });
  const [sentenceForm, setSentenceForm] = useState({
    text: "",
    orderedWords: [] as string[],
    distractors: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Emoji generator state
  const [isGeneratingEmoji, setIsGeneratingEmoji] = useState(false);
  const [generatedEmoji, setGeneratedEmoji] = useState<string | null>(null);
  const [emojiError, setEmojiError] = useState<string | null>(null);
  const [emojiContext, setEmojiContext] = useState("");

  // Audio sync states
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    blobCount: number;
    alreadyInDb: number;
    newlyAdded: number;
    addedWords: string[];
    errors?: string[];
    debug?: {
      tokenConfigured: boolean;
      prefix: string;
    };
  } | null>(null);

  // Audio playback states
  const [playingWordId, setPlayingWordId] = useState<string | null>(null);
  const [playingSentenceId, setPlayingSentenceId] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Audio sync handler
  const handleAudioSync = useCallback(async () => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const response = await fetch("/api/admin/sync-audio", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync audio");
      }

      // Check if we got an error in the response
      if (data.error) {
        throw new Error(data.error);
      }

      setSyncResult(data);

      // Refresh words list to show newly synced words
      const wordsResponse = await fetch("/api/admin/words");
      if (wordsResponse.ok) {
        const wordsData = await wordsResponse.json();
        setWords(wordsData.words || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync audio");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Play word audio handler
  const handlePlayWordAudio = useCallback(async (wordId: string, wordText: string) => {
    setAudioError(null);
    setPlayingWordId(wordId);

    try {
      const response = await fetch(`/api/audio/${encodeURIComponent(wordText)}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to load audio" }));
        throw new Error(errorData.error || "Failed to load audio");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setPlayingWordId(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setPlayingWordId(null);
        setAudioError("Failed to play audio");
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (err) {
      setPlayingWordId(null);
      setAudioError(err instanceof Error ? err.message : "Failed to play audio");
    }
  }, []);

  // Play sentence audio handler
  const handlePlaySentenceAudio = useCallback(async (sentenceId: string, sentenceText: string) => {
    setAudioError(null);
    setPlayingSentenceId(sentenceId);

    try {
      const response = await fetch("/api/audio/sentence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence: sentenceText }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to generate audio" }));
        throw new Error(errorData.error || "Failed to generate audio");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setPlayingSentenceId(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setPlayingSentenceId(null);
        setAudioError("Failed to play audio");
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (err) {
      setPlayingSentenceId(null);
      setAudioError(err instanceof Error ? err.message : "Failed to play audio");
    }
  }, []);

  // Filter words
  const filteredWords = useMemo(() => {
    return words.filter((word) => {
      const matchesSearch = word.text.toLowerCase().includes(wordSearch.toLowerCase());
      const matchesLevel = wordLevelFilter === "all" || word.type === wordLevelFilter;
      const wordType = getWordType(word);
      const matchesType = wordTypeFilter === "all" || wordType === wordTypeFilter;
      return matchesSearch && matchesLevel && matchesType;
    });
  }, [words, wordSearch, wordLevelFilter, wordTypeFilter]);

  // Filter sentences
  const filteredSentences = useMemo(() => {
    return sentences.filter((sentence) =>
      sentence.text.toLowerCase().includes(sentenceSearch.toLowerCase())
    );
  }, [sentences, sentenceSearch]);

  // Pagination calculations
  const totalWordPages = Math.ceil(filteredWords.length / WORDS_PER_PAGE);
  const totalSentencePages = Math.ceil(filteredSentences.length / SENTENCES_PER_PAGE);
  const paginatedWords = filteredWords.slice((wordPage - 1) * WORDS_PER_PAGE, wordPage * WORDS_PER_PAGE);
  const paginatedSentences = filteredSentences.slice((sentencePage - 1) * SENTENCES_PER_PAGE, sentencePage * SENTENCES_PER_PAGE);

  // Reset page when filters change
  useEffect(() => {
    setWordPage(1);
  }, [wordSearch, wordLevelFilter, wordTypeFilter]);

  useEffect(() => {
    setSentencePage(1);
  }, [sentenceSearch]);

  // Helper to look up word metadata for preview
  const getWordMetadata = useCallback((wordText: string) => {
    const normalizedText = wordText.toLowerCase().trim();
    const word = words.find((w) => w.text.toLowerCase() === normalizedText);
    if (!word) {
      // Check if it's punctuation
      if (/^[.!?,;:]$/.test(wordText)) {
        return { text: wordText, isPunctuation: true, isSightWord: false, isCharacterWord: false, emoji: null, imageUrl: null };
      }
      // Unknown word - treat as "other"
      return { text: wordText, isPunctuation: false, isSightWord: false, isCharacterWord: false, emoji: getAutoEmoji(wordText), imageUrl: null };
    }
    return {
      text: word.text,
      isPunctuation: false,
      isSightWord: word.isSightWord || false,
      isCharacterWord: word.isCharacterWord || false,
      emoji: word.emoji || getAutoEmoji(wordText),
      imageUrl: word.imageUrl || null,
    };
  }, [words]);

  // Word CRUD
  const openWordModal = (mode: "create" | "edit", word?: WordWithAdventures) => {
    if (word) {
      setWordForm({
        text: word.text,
        type: word.type,
        isSightWord: word.isSightWord || false,
        isCharacterWord: word.isCharacterWord || false,
        emoji: word.emoji || "",
        imageUrl: word.imageUrl || "",
      });
    } else {
      setWordForm({
        text: "",
        type: "custom",
        isSightWord: false,
        isCharacterWord: false,
        emoji: "",
        imageUrl: "",
      });
    }
    setWordModal({ mode, word });
    setError(null);
    setGeneratedEmoji(null);
    setEmojiError(null);
    setEmojiContext("");
  };

  // Generate AI emoji
  const handleGenerateEmoji = useCallback(async () => {
    if (!wordForm.text.trim()) {
      setEmojiError("Enter a word first");
      return;
    }

    setIsGeneratingEmoji(true);
    setEmojiError(null);
    setGeneratedEmoji(null);

    try {
      // Build prompt with optional context
      const basePrompt = wordForm.text.trim();
      const fullPrompt = emojiContext.trim()
        ? `${basePrompt} (${emojiContext.trim()})`
        : basePrompt;

      const response = await fetch("/api/admin/generate-emoji", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          style: "flat",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate emoji");
      }

      const data = await response.json();
      setGeneratedEmoji(data.imageData);
    } catch (err) {
      setEmojiError(err instanceof Error ? err.message : "Failed to generate emoji");
    } finally {
      setIsGeneratingEmoji(false);
    }
  }, [wordForm.text, emojiContext]);

  // Use generated emoji (upload to blob and set as image URL)
  const handleUseGeneratedEmoji = useCallback(async () => {
    if (!generatedEmoji || !wordForm.text.trim()) return;

    setIsGeneratingEmoji(true);
    setEmojiError(null);

    try {
      // Upload to Vercel Blob
      const response = await fetch("/api/admin/upload-emoji", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: generatedEmoji,
          filename: wordForm.text.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload emoji");
      }

      const data = await response.json();
      setWordForm((f) => ({ ...f, imageUrl: data.url, emoji: "" }));
      setGeneratedEmoji(null);
    } catch (err) {
      setEmojiError(err instanceof Error ? err.message : "Failed to upload emoji");
    } finally {
      setIsGeneratingEmoji(false);
    }
  }, [generatedEmoji, wordForm.text]);

  const handleWordSubmit = useCallback(async () => {
    if (!wordForm.text.trim()) {
      setError("Please enter a word");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const isEdit = wordModal?.mode === "edit" && wordModal.word;
      const url = isEdit ? `/api/admin/words/${wordModal.word!.id}` : "/api/admin/words";
      const method = isEdit ? "PATCH" : "POST";

      // Sight words should be lowercase; non-sight words preserve capitalization
      const wordText = wordForm.isSightWord
        ? wordForm.text.trim().toLowerCase()
        : wordForm.text.trim();

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: wordText,
          type: wordForm.type,
          isSightWord: wordForm.isSightWord,
          isCharacterWord: wordForm.isSightWord ? false : wordForm.isCharacterWord,
          // Only include emoji/image for non-sight words
          emoji: wordForm.isSightWord ? null : (wordForm.emoji || null),
          imageUrl: wordForm.isSightWord ? null : (wordForm.imageUrl || null),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save word");
      }

      const data = await response.json();
      const savedWord = data.word || data;

      if (isEdit) {
        setWords((prev) => prev.map((w) => (w.id === savedWord.id ? savedWord : w)));
      } else {
        setWords((prev) => [savedWord, ...prev]);
      }

      setWordModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save word");
    } finally {
      setIsLoading(false);
    }
  }, [wordForm, wordModal]);

  const handleDeleteWord = useCallback(async () => {
    if (!deleteModal || deleteModal.type !== "word") return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/words/${deleteModal.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete word");
      }

      setWords((prev) => prev.filter((w) => w.id !== deleteModal.id));
      setDeleteModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete word");
    } finally {
      setIsLoading(false);
    }
  }, [deleteModal]);

  // Sentence CRUD
  const openSentenceModal = (mode: "create" | "edit", sentence?: Sentence) => {
    if (sentence) {
      setSentenceForm({
        text: sentence.text,
        orderedWords: sentence.orderedWords || [],
        distractors: sentence.distractors || [],
      });
    } else {
      setSentenceForm({ text: "", orderedWords: [], distractors: [] });
    }
    setSentenceModal({ mode, sentence });
    setError(null);
  };

  const parseSentenceWords = (text: string): string[] => {
    return text
      .toLowerCase()
      .replace(/[^a-z'\s-]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 0);
  };

  const handleSentenceSubmit = useCallback(async () => {
    if (!sentenceForm.text.trim()) {
      setError("Please enter a sentence");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const isEdit = sentenceModal?.mode === "edit" && sentenceModal.sentence;
      const url = isEdit
        ? `/api/admin/sentences/${sentenceModal.sentence!.id}`
        : "/api/admin/sentences";
      const method = isEdit ? "PATCH" : "POST";

      const orderedWords =
        sentenceForm.orderedWords.length > 0
          ? sentenceForm.orderedWords
          : parseSentenceWords(sentenceForm.text);

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sentenceForm.text.trim(),
          orderedWords,
          distractors: sentenceForm.distractors,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save sentence");
      }

      const data = await response.json();
      const savedSentence = data.sentence || data;

      if (isEdit) {
        setSentences((prev) =>
          prev.map((s) => (s.id === savedSentence.id ? savedSentence : s))
        );
      } else {
        setSentences((prev) => [savedSentence, ...prev]);
      }

      setSentenceModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save sentence");
    } finally {
      setIsLoading(false);
    }
  }, [sentenceForm, sentenceModal]);

  const handleDeleteSentence = useCallback(async () => {
    if (!deleteModal || deleteModal.type !== "sentence") return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/sentences/${deleteModal.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete sentence");
      }

      setSentences((prev) => prev.filter((s) => s.id !== deleteModal.id));
      setDeleteModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete sentence");
    } finally {
      setIsLoading(false);
    }
  }, [deleteModal]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Library</h1>
        <p className="text-gray-500 mt-1">Manage words, sentences, and themes</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex gap-2 p-2">
            {(["words", "sentences", "themes"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 font-medium rounded-lg transition ${
                  activeTab === tab
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab === "words" && `📝 Words (${words.length})`}
                {tab === "sentences" && `📖 Sentences (${sentences.length})`}
                {tab === "themes" && `🎨 Themes (${themes.length})`}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Audio Error Display */}
          {audioError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between">
              <span>Audio error: {audioError}</span>
              <button
                onClick={() => setAudioError(null)}
                className="ml-2 p-1 hover:bg-red-100 rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Words Tab */}
          {activeTab === "words" && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4 items-center flex-wrap">
                <input
                  type="text"
                  placeholder="Search words..."
                  value={wordSearch}
                  onChange={(e) => setWordSearch(e.target.value)}
                  className="flex-1 min-w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <select
                  value={wordTypeFilter}
                  onChange={(e) => setWordTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  {WORD_TYPE_FILTERS.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <select
                  value={wordLevelFilter}
                  onChange={(e) => setWordLevelFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="all">All Types</option>
                  {WORD_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => openWordModal("create")}
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                >
                  + Add Word
                </button>
              </div>

              {/* Audio Sync Panel */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-amber-900">Sync Generated Audio</h3>
                    <p className="text-sm text-amber-700">
                      Scan blob storage for auto-generated TTS audio and add missing words to database
                    </p>
                  </div>
                  <button
                    onClick={handleAudioSync}
                    disabled={isSyncing}
                    className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 transition"
                  >
                    {isSyncing ? "Syncing..." : "Sync Audio"}
                  </button>
                </div>
                {syncResult && (
                  <div className="mt-3 pt-3 border-t border-amber-200">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-bold text-amber-800">{syncResult.blobCount}</div>
                        <div className="text-amber-600">In Blob Storage</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-amber-800">{syncResult.alreadyInDb}</div>
                        <div className="text-amber-600">Already in DB</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-700">{syncResult.newlyAdded}</div>
                        <div className="text-green-600">Newly Added</div>
                      </div>
                    </div>
                    {syncResult.addedWords.length > 0 && (
                      <div className="mt-2 text-sm text-amber-700">
                        Added: {syncResult.addedWords.join(", ")}
                      </div>
                    )}
                    {syncResult.blobCount === 0 && (
                      <div className="mt-2 text-sm text-amber-700 bg-amber-100 rounded p-2">
                        <strong>No audio files found.</strong> Audio files are auto-generated when
                        words are played in the game. Try playing a level first to generate audio,
                        then sync again.
                        {syncResult.debug && (
                          <div className="mt-1 text-xs text-amber-600">
                            Token configured: {syncResult.debug.tokenConfigured ? "Yes" : "No"} |
                            Prefix: {syncResult.debug.prefix}
                          </div>
                        )}
                      </div>
                    )}
                    {syncResult.errors && syncResult.errors.length > 0 && (
                      <div className="mt-2 text-sm text-red-700">
                        Errors: {syncResult.errors.slice(0, 3).join(", ")}
                        {syncResult.errors.length > 3 && ` (+${syncResult.errors.length - 3} more)`}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Word Table */}
              <div className="overflow-hidden border border-gray-200 rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Word
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Flags
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Adventures
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Visual
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedWords.map((word) => {
                      const wordType = getWordType(word);
                      const colors = DEFAULT_WORD_COLORS[wordType];
                      const hasVisual = word.imageUrl || word.emoji;

                      return (
                        <tr key={word.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className="px-3 py-1.5 font-medium rounded-lg inline-block border"
                                style={{
                                  backgroundColor: colors.background,
                                  borderColor: colors.border,
                                  color: colors.text,
                                }}
                              >
                                {word.text}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              {word.isSightWord && (
                                <span className="px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-700 inline-block w-fit">
                                  Sight
                                </span>
                              )}
                              {word.isCharacterWord && (
                                <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-700 inline-block w-fit">
                                  Character
                                </span>
                              )}
                              {!word.isSightWord && !word.isCharacterWord && (
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                              {word.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {word.adventures && word.adventures.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {word.adventures.slice(0, 3).map((adventure) => (
                                  <span
                                    key={adventure.id}
                                    className="px-2 py-0.5 text-xs font-medium rounded"
                                    style={{
                                      backgroundColor: adventure.palette?.primary + "22" || "#e5e7eb",
                                      color: adventure.palette?.primary || "#374151",
                                    }}
                                  >
                                    {adventure.displayName}
                                  </span>
                                ))}
                                {word.adventures.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{word.adventures.length - 3}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {hasVisual ? (
                              <div className="flex items-center gap-2">
                                {word.imageUrl ? (
                                  <img
                                    src={word.imageUrl}
                                    alt={word.text}
                                    className="w-8 h-8 object-cover rounded"
                                  />
                                ) : word.emoji ? (
                                  <span className="text-2xl">{word.emoji}</span>
                                ) : null}
                                {word.isSightWord && (
                                  <span className="text-xs text-orange-500" title="Sight words shouldn't have visuals">⚠️</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">
                                {word.isSightWord ? "—" : "None"}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              {/* Preview */}
                              <button
                                onClick={() => setPreviewWord(word)}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                title="Preview word card"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              {/* Play Audio */}
                              <button
                                onClick={() => handlePlayWordAudio(word.id, word.text)}
                                disabled={playingWordId === word.id}
                                className={`p-2 rounded-lg transition ${
                                  playingWordId === word.id
                                    ? "text-indigo-600 bg-indigo-50"
                                    : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                                }`}
                                title={playingWordId === word.id ? "Playing..." : "Play audio"}
                              >
                                {playingWordId === word.id ? (
                                  <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                  </svg>
                                )}
                              </button>
                              {/* Edit */}
                              <button
                                onClick={() => openWordModal("edit", word)}
                                className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                                title="Edit word"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              {/* Delete */}
                              <button
                                onClick={() =>
                                  setDeleteModal({ type: "word", id: word.id, text: word.text })
                                }
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                                title="Delete word"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* Pagination Controls */}
                <div className="px-6 py-3 bg-gray-50 flex items-center justify-between border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Showing {((wordPage - 1) * WORDS_PER_PAGE) + 1}-{Math.min(wordPage * WORDS_PER_PAGE, filteredWords.length)} of {filteredWords.length} words
                  </div>
                  {totalWordPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setWordPage((p) => Math.max(1, p - 1))}
                        disabled={wordPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {wordPage} of {totalWordPages}
                      </span>
                      <button
                        onClick={() => setWordPage((p) => Math.min(totalWordPages, p + 1))}
                        disabled={wordPage === totalWordPages}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sentences Tab */}
          {activeTab === "sentences" && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4 items-center">
                <input
                  type="text"
                  placeholder="Search sentences..."
                  value={sentenceSearch}
                  onChange={(e) => setSentenceSearch(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={() => openSentenceModal("create")}
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                >
                  + Add Sentence
                </button>
              </div>

              {/* Sentence List */}
              <div className="space-y-3">
                {paginatedSentences.map((sentence) => (
                  <div
                    key={sentence.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-lg text-gray-900">&ldquo;{sentence.text}&rdquo;</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(sentence.orderedWords || []).map((word, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded"
                            >
                              {word}
                            </span>
                          ))}
                          {(sentence.distractors || []).map((word, i) => (
                            <span
                              key={`d-${i}`}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
                            >
                              {word} (distractor)
                            </span>
                          ))}
                        </div>
                        {/* Adventure Badge */}
                        {sentence.adventure && (
                          <div className="mt-2">
                            <span
                              className="px-2 py-0.5 text-xs font-medium rounded"
                              style={{
                                backgroundColor: sentence.adventure.palette?.primary + "22" || "#e5e7eb",
                                color: sentence.adventure.palette?.primary || "#374151",
                              }}
                            >
                              {sentence.adventure.displayName}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Preview */}
                        <button
                          onClick={() => setPreviewSentence(sentence)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                          title="Preview sentence"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {/* Play Audio */}
                        <button
                          onClick={() => handlePlaySentenceAudio(sentence.id, sentence.text)}
                          disabled={playingSentenceId === sentence.id}
                          className={`p-2 rounded-lg transition ${
                            playingSentenceId === sentence.id
                              ? "text-indigo-600 bg-indigo-50"
                              : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                          }`}
                          title={playingSentenceId === sentence.id ? "Playing..." : "Play sentence audio"}
                        >
                          {playingSentenceId === sentence.id ? (
                            <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                          )}
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => openSentenceModal("edit", sentence)}
                          className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit sentence"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() =>
                            setDeleteModal({
                              type: "sentence",
                              id: sentence.id,
                              text: sentence.text,
                            })
                          }
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                          title="Delete sentence"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Pagination Controls */}
                {filteredSentences.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Showing {((sentencePage - 1) * SENTENCES_PER_PAGE) + 1}-{Math.min(sentencePage * SENTENCES_PER_PAGE, filteredSentences.length)} of {filteredSentences.length} sentences
                    </div>
                    {totalSentencePages > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSentencePage((p) => Math.max(1, p - 1))}
                          disabled={sentencePage === 1}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-gray-600">
                          Page {sentencePage} of {totalSentencePages}
                        </span>
                        <button
                          onClick={() => setSentencePage((p) => Math.min(totalSentencePages, p + 1))}
                          disabled={sentencePage === totalSentencePages}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Themes Tab */}
          {activeTab === "themes" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {themes.map((theme) => {
                  const themeCampaigns = campaigns.filter((c) => c.themeId === theme.id);
                  const totalMissions = themeCampaigns.reduce(
                    (sum, c) => sum + (c.missions?.length || 0),
                    0
                  );
                  const totalSentences = themeCampaigns.reduce(
                    (sum, c) =>
                      sum +
                      (c.missions?.reduce((ms, m) => ms + (m.sentences?.length || 0), 0) || 0),
                    0
                  );

                  return (
                    <div
                      key={theme.id}
                      className="bg-white rounded-xl border-2 overflow-hidden"
                      style={{ borderColor: theme.palette?.primary || "#6366f1" }}
                    >
                      <div
                        className="p-4 text-white"
                        style={{ backgroundColor: theme.palette?.primary || "#6366f1" }}
                      >
                        <h3 className="font-bold text-lg">{theme.displayName}</h3>
                        <p className="text-sm opacity-80">{theme.name}</p>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Status</span>
                          <span
                            className={
                              theme.isActive ? "text-green-600 font-medium" : "text-gray-400"
                            }
                          >
                            {theme.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Campaigns</span>
                          <span className="font-medium">{themeCampaigns.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Missions</span>
                          <span className="font-medium">{totalMissions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Sentences</span>
                          <span className="font-medium">{totalSentences}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Characters</span>
                          <span className="font-medium">{theme.characters?.length || 0}</span>
                        </div>

                        {/* Color Palette */}
                        {theme.palette && (
                          <div className="flex gap-1 pt-2">
                            {Object.entries(theme.palette)
                              .slice(0, 6)
                              .map(([key, color]) => (
                                <div
                                  key={key}
                                  className="w-6 h-6 rounded-full border border-gray-200"
                                  style={{ backgroundColor: color }}
                                  title={key}
                                />
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {themes.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No themes found. Use the AI Generator to create one!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Word Modal */}
      <AnimatePresence>
        {wordModal && (() => {
          const suggestedEmoji = getAutoEmoji(wordForm.text);

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setWordModal(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {wordModal.mode === "create" ? "Add New Word" : "Edit Word"}
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {/* Word Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Word Text
                    </label>
                    <input
                      type="text"
                      value={wordForm.text}
                      onChange={(e) => setWordForm((f) => ({ ...f, text: e.target.value }))}
                      placeholder="Enter word (e.g., 'Chase' or 'the')"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Non-sight words preserve capitalization (e.g., "Chase")
                    </p>
                  </div>

                  {/* Flags Section */}
                  <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                    <h3 className="text-sm font-medium text-gray-700">Word Flags</h3>

                    {/* Sight Word Toggle */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isSightWord"
                        checked={wordForm.isSightWord}
                        onChange={(e) =>
                          setWordForm((f) => ({
                            ...f,
                            isSightWord: e.target.checked,
                            // Clear character flag if enabling sight word
                            isCharacterWord: e.target.checked ? false : f.isCharacterWord,
                          }))
                        }
                        className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <label htmlFor="isSightWord" className="text-sm text-gray-700">
                        <span className="font-medium text-amber-700">Sight Word</span>
                        <span className="text-gray-500 ml-1">(learning target, no pictures)</span>
                      </label>
                    </div>

                    {/* Character Word Toggle - only for non-sight words */}
                    {!wordForm.isSightWord && (
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="isCharacterWord"
                          checked={wordForm.isCharacterWord}
                          onChange={(e) =>
                            setWordForm((f) => ({ ...f, isCharacterWord: e.target.checked }))
                          }
                          className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="isCharacterWord" className="text-sm text-gray-700">
                          <span className="font-medium text-purple-700">Character</span>
                          <span className="text-gray-500 ml-1">(theme character name)</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Type (Dolch level or category) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={wordForm.type}
                      onChange={(e) => setWordForm((f) => ({ ...f, type: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white"
                    >
                      <optgroup label="Non-Sight Words">
                        {WORD_TYPES.filter(t => ["custom", "generated"].includes(t.value)).map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Dolch Sight Word Levels">
                        {WORD_TYPES.filter(t => !["custom", "generated"].includes(t.value)).map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {WORD_TYPES.find(t => t.value === wordForm.type)?.description}
                    </p>
                  </div>

                  {/* Visual fields - only for non-sight words */}
                  {!wordForm.isSightWord && (
                    <>
                      {/* Emoji field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Emoji (optional)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={wordForm.emoji}
                            onChange={(e) => setWordForm((f) => ({ ...f, emoji: e.target.value }))}
                            placeholder="e.g. 🐕"
                            className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            maxLength={10}
                          />
                          {/* Clear button - shown when emoji is set */}
                          {wordForm.emoji && (
                            <button
                              type="button"
                              onClick={() => setWordForm((f) => ({ ...f, emoji: "" }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-red-100 text-gray-500 hover:text-red-600 rounded-full transition"
                              title="Clear emoji"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                        {/* Suggestion - shown below when no emoji is set */}
                        {suggestedEmoji && !wordForm.emoji && (
                          <button
                            type="button"
                            onClick={() => setWordForm((f) => ({ ...f, emoji: suggestedEmoji }))}
                            className="mt-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-sm text-amber-700 transition flex items-center gap-2"
                            title="Use suggested emoji"
                          >
                            <span className="text-lg">{suggestedEmoji}</span>
                            <span>Use suggestion</span>
                          </button>
                        )}
                      </div>

                      {/* Image URL field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image URL (optional, overrides emoji)
                        </label>
                        <input
                          type="text"
                          value={wordForm.imageUrl}
                          onChange={(e) => setWordForm((f) => ({ ...f, imageUrl: e.target.value }))}
                          placeholder="https://..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {wordForm.imageUrl && (
                          <div className="mt-2">
                            <img
                              src={wordForm.imageUrl}
                              alt="Preview"
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                              onError={(e) => (e.currentTarget.style.display = "none")}
                            />
                          </div>
                        )}
                      </div>

                      {/* AI Emoji Generator */}
                      <div className="border border-purple-200 rounded-xl p-4 bg-purple-50">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">✨</span>
                          <h4 className="font-medium text-purple-900">AI Emoji Generator</h4>
                        </div>
                        <p className="text-sm text-purple-700 mb-3">
                          Generate a custom emoji image for this word using AI
                        </p>

                        {/* Optional context input */}
                        <div className="mb-3">
                          <input
                            type="text"
                            value={emojiContext}
                            onChange={(e) => setEmojiContext(e.target.value)}
                            placeholder="Optional context (e.g., 'cartoon style', 'Paw Patrol dog')"
                            className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <p className="mt-1 text-xs text-purple-600">
                            Add extra details to customize the generated image
                          </p>
                        </div>

                        <div className="flex gap-2 items-start">
                          <button
                            type="button"
                            onClick={handleGenerateEmoji}
                            disabled={isGeneratingEmoji || !wordForm.text.trim()}
                            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                          >
                            {isGeneratingEmoji ? (
                              <>
                                <span className="animate-spin">⏳</span>
                                Generating...
                              </>
                            ) : (
                              <>Generate Emoji</>
                            )}
                          </button>

                          {generatedEmoji && (
                            <div className="flex items-center gap-3">
                              <img
                                src={generatedEmoji}
                                alt="Generated emoji"
                                className="w-16 h-16 object-cover rounded-lg border-2 border-purple-300"
                              />
                              <div className="flex flex-col gap-1">
                                <button
                                  type="button"
                                  onClick={handleUseGeneratedEmoji}
                                  disabled={isGeneratingEmoji}
                                  className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                                >
                                  Use This
                                </button>
                                <button
                                  type="button"
                                  onClick={handleGenerateEmoji}
                                  disabled={isGeneratingEmoji}
                                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 transition"
                                >
                                  Regenerate
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {emojiError && (
                          <div className="mt-2 text-sm text-red-600">{emojiError}</div>
                        )}
                      </div>
                    </>
                  )}

                  {wordForm.isSightWord && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm">
                      Sight words do not have pictures - they focus on word recognition
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
                  <button
                    onClick={() => setWordModal(null)}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWordSubmit}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {isLoading ? "Saving..." : "Save Word"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Sentence Modal */}
      <AnimatePresence>
        {sentenceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSentenceModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {sentenceModal.mode === "create" ? "Add New Sentence" : "Edit Sentence"}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sentence Text
                  </label>
                  <textarea
                    value={sentenceForm.text}
                    onChange={(e) =>
                      setSentenceForm((f) => ({ ...f, text: e.target.value }))
                    }
                    placeholder="Enter sentence..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distractors (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={sentenceForm.distractors.join(", ")}
                    onChange={(e) =>
                      setSentenceForm((f) => ({
                        ...f,
                        distractors: e.target.value.split(",").map((d) => d.trim()).filter(Boolean),
                      }))
                    }
                    placeholder="cat, small, fast"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Extra words to include that are not part of the correct sentence
                  </p>
                </div>
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setSentenceModal(null)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSentenceSubmit}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {isLoading ? "Saving..." : "Save Sentence"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setDeleteModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete {deleteModal.type === "word" ? "Word" : "Sentence"}?
                </h2>
                <p className="text-gray-600">
&ldquo;{deleteModal.text.length > 50
                    ? deleteModal.text.slice(0, 50) + "..."
                    : deleteModal.text}&rdquo;
                </p>
                <p className="text-sm text-red-600 mt-2">This action cannot be undone.</p>
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    deleteModal.type === "word" ? handleDeleteWord : handleDeleteSentence
                  }
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Word Preview Modal */}
      <AnimatePresence>
        {previewWord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setPreviewWord(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Word Card Preview</h3>
                <button
                  onClick={() => setPreviewWord(null)}
                  className="p-1 hover:bg-white/50 rounded-full transition"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Word Card Preview */}
              <div className="flex flex-col items-center gap-4">
                {(() => {
                  const hasImage = !previewWord.isSightWord && previewWord.imageUrl;
                  const hasEmoji = !previewWord.isSightWord && previewWord.emoji && !previewWord.imageUrl;

                  // Get colors based on word type
                  let bgColor: string = DEFAULT_WORD_COLORS.other.background;
                  let borderColor: string = DEFAULT_WORD_COLORS.other.border;
                  let textColor: string = DEFAULT_WORD_COLORS.other.text;

                  if (previewWord.isSightWord) {
                    bgColor = DEFAULT_WORD_COLORS.sight.background;
                    borderColor = DEFAULT_WORD_COLORS.sight.border;
                    textColor = DEFAULT_WORD_COLORS.sight.text;
                  } else if (previewWord.isCharacterWord) {
                    bgColor = DEFAULT_WORD_COLORS.character.background;
                    borderColor = DEFAULT_WORD_COLORS.character.border;
                    textColor = DEFAULT_WORD_COLORS.character.text;
                  }

                  return (
                    <>
                      {/* The card */}
                      <div
                        className="min-w-[120px] px-6 h-[70px] flex items-center justify-center gap-3 rounded-2xl font-bold text-2xl shadow-lg"
                        style={{
                          backgroundColor: bgColor,
                          borderWidth: "3px",
                          borderStyle: "solid",
                          borderColor: borderColor,
                          color: textColor,
                        }}
                      >
                        {hasEmoji && (
                          <span className="text-2xl">{previewWord.emoji}</span>
                        )}
                        {hasImage && previewWord.imageUrl && (
                          <button
                            onClick={() => setPreviewImage({ url: previewWord.imageUrl!, word: previewWord.text })}
                            className="flex-shrink-0 hover:scale-110 transition-transform"
                          >
                            <img
                              src={previewWord.imageUrl}
                              alt={previewWord.text}
                              className="w-10 h-10 object-cover rounded"
                            />
                          </button>
                        )}
                        <span>{previewWord.text}</span>
                      </div>

                      {/* Word info */}
                      <div className="text-center space-y-2 mt-4">
                        <div className="flex flex-wrap justify-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            previewWord.isSightWord
                              ? "bg-amber-100 text-amber-800"
                              : previewWord.isCharacterWord
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                          }`}>
                            {previewWord.isSightWord ? "Sight Word" : previewWord.isCharacterWord ? "Character" : "Other"}
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {previewWord.type}
                          </span>
                        </div>
                        {previewWord.emoji && (
                          <p className="text-sm text-gray-600">Emoji: {previewWord.emoji}</p>
                        )}
                        {previewWord.imageUrl && (
                          <p className="text-sm text-gray-600">Has image</p>
                        )}
                      </div>

                      {/* Legend */}
                      <div className="mt-4 pt-4 border-t border-gray-200 w-full">
                        <p className="text-xs text-gray-500 text-center mb-2">Card Color Legend</p>
                        <div className="flex justify-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: DEFAULT_WORD_COLORS.sight.background, border: `1px solid ${DEFAULT_WORD_COLORS.sight.border}` }} />
                            <span className="text-gray-600">Sight</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: DEFAULT_WORD_COLORS.character.background, border: `1px solid ${DEFAULT_WORD_COLORS.character.border}` }} />
                            <span className="text-gray-600">Character</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: DEFAULT_WORD_COLORS.other.background, border: `1px solid ${DEFAULT_WORD_COLORS.other.border}` }} />
                            <span className="text-gray-600">Other</span>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sentence Preview Modal */}
      <AnimatePresence>
        {previewSentence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setPreviewSentence(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-b from-indigo-50 to-purple-100 rounded-2xl shadow-2xl max-w-3xl w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Sentence Preview</h3>
                <button
                  onClick={() => setPreviewSentence(null)}
                  className="w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow transition"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Sentence text */}
              <p className="text-center text-lg text-gray-600 mb-6">
                &ldquo;{previewSentence.text}&rdquo;
              </p>

              {/* Word Cards Preview - mimics game layout */}
              <div className="bg-white/60 rounded-xl p-6 mb-4">
                <p className="text-sm text-gray-500 mb-3 text-center">Answer Words (in order)</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {(previewSentence.orderedWords || []).map((wordText, idx) => {
                    const meta = getWordMetadata(wordText);
                    const hasImage = !meta.isSightWord && meta.imageUrl;
                    const hasEmoji = !meta.isSightWord && meta.emoji && !meta.imageUrl;

                    // Get colors based on word type
                    let bgColor: string = DEFAULT_WORD_COLORS.other.background;
                    let borderColor: string = DEFAULT_WORD_COLORS.other.border;
                    let textColor: string = DEFAULT_WORD_COLORS.other.text;

                    if (meta.isSightWord) {
                      bgColor = DEFAULT_WORD_COLORS.sight.background;
                      borderColor = DEFAULT_WORD_COLORS.sight.border;
                      textColor = DEFAULT_WORD_COLORS.sight.text;
                    } else if (meta.isCharacterWord) {
                      bgColor = DEFAULT_WORD_COLORS.character.background;
                      borderColor = DEFAULT_WORD_COLORS.character.border;
                      textColor = DEFAULT_WORD_COLORS.character.text;
                    }

                    return (
                      <div
                        key={idx}
                        className={`
                          ${meta.isPunctuation ? "min-w-[40px] px-2" : "min-w-[70px] px-3"}
                          h-[50px] flex items-center justify-center gap-1.5 rounded-xl
                          font-bold text-lg shadow-md transition-transform hover:scale-105
                        `}
                        style={{
                          backgroundColor: bgColor,
                          borderWidth: "2px",
                          borderStyle: "solid",
                          borderColor: borderColor,
                          color: textColor,
                        }}
                      >
                        {/* Emoji inline */}
                        {hasEmoji && (
                          <span className="text-base">{meta.emoji}</span>
                        )}
                        {/* Image thumbnail */}
                        {hasImage && meta.imageUrl && (
                          <button
                            onClick={() => setPreviewImage({ url: meta.imageUrl!, word: wordText })}
                            className="flex-shrink-0 hover:scale-110 transition-transform"
                          >
                            <img
                              src={meta.imageUrl}
                              alt={wordText}
                              className="w-7 h-7 object-cover rounded"
                            />
                          </button>
                        )}
                        <span>{wordText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Distractor Words */}
              {(previewSentence.distractors || []).length > 0 && (
                <div className="bg-red-50/60 rounded-xl p-6">
                  <p className="text-sm text-red-500 mb-3 text-center">Distractor Words</p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {(previewSentence.distractors || []).map((wordText, idx) => {
                      const meta = getWordMetadata(wordText);
                      const hasImage = !meta.isSightWord && meta.imageUrl;
                      const hasEmoji = !meta.isSightWord && meta.emoji && !meta.imageUrl;

                      // Distractors use same styling logic
                      let bgColor: string = DEFAULT_WORD_COLORS.other.background;
                      let borderColor: string = DEFAULT_WORD_COLORS.other.border;
                      let textColor: string = DEFAULT_WORD_COLORS.other.text;

                      if (meta.isSightWord) {
                        bgColor = DEFAULT_WORD_COLORS.sight.background;
                        borderColor = DEFAULT_WORD_COLORS.sight.border;
                        textColor = DEFAULT_WORD_COLORS.sight.text;
                      } else if (meta.isCharacterWord) {
                        bgColor = DEFAULT_WORD_COLORS.character.background;
                        borderColor = DEFAULT_WORD_COLORS.character.border;
                        textColor = DEFAULT_WORD_COLORS.character.text;
                      }

                      return (
                        <div
                          key={idx}
                          className="min-w-[70px] px-3 h-[50px] flex items-center justify-center gap-1.5 rounded-xl font-bold text-lg shadow-md opacity-70"
                          style={{
                            backgroundColor: bgColor,
                            borderWidth: "2px",
                            borderStyle: "solid",
                            borderColor: borderColor,
                            color: textColor,
                          }}
                        >
                          {hasEmoji && (
                            <span className="text-base">{meta.emoji}</span>
                          )}
                          {hasImage && meta.imageUrl && (
                            <button
                              onClick={() => setPreviewImage({ url: meta.imageUrl!, word: wordText })}
                              className="flex-shrink-0 hover:scale-110 transition-transform"
                            >
                              <img
                                src={meta.imageUrl}
                                alt={wordText}
                                className="w-7 h-7 object-cover rounded"
                              />
                            </button>
                          )}
                          <span>{wordText}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded" style={{ backgroundColor: DEFAULT_WORD_COLORS.sight.background, border: `1px solid ${DEFAULT_WORD_COLORS.sight.border}` }} />
                  <span>Sight Word</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded" style={{ backgroundColor: DEFAULT_WORD_COLORS.character.background, border: `1px solid ${DEFAULT_WORD_COLORS.character.border}` }} />
                  <span>Character</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded" style={{ backgroundColor: DEFAULT_WORD_COLORS.other.background, border: `1px solid ${DEFAULT_WORD_COLORS.other.border}` }} />
                  <span>Other</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="aspect-square bg-gray-100 flex items-center justify-center p-4">
                <img
                  src={previewImage.url}
                  alt={previewImage.word}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
              <div className="p-4 bg-gradient-to-t from-gray-50 to-white border-t border-gray-100">
                <p className="text-center text-2xl font-bold text-gray-800">{previewImage.word}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
