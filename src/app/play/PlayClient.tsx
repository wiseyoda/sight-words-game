"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SentenceBuilder, MissionIntro, MissionComplete } from "@/components/game";
import { calculateStars } from "@/lib/game/starCalculation";
import { useTheme } from "@/lib/theme";
import { useThemeFeedback, useThemeFeedbackText } from "@/lib/audio/useThemeFeedback";
import { WordMetadataProvider, useWordMetadata } from "@/lib/words/WordMetadataContext";
import { MuteToggle } from "@/components/ui/AudioControls";
import type { ThemeCharacter, FeedbackPhrases, Word } from "@/lib/db/schema";

interface Mission {
  id: string;
  title: string;
  narrativeIntro: string | null;
  narrativeOutro?: string | null;
  type?: string | null;
  campaignId?: string | null;
}

interface Sentence {
  id: string;
  text: string;
  orderedWords: string[];
  distractors: string[];
}

interface ThemeData {
  id: string;
  name: string;
  displayName: string;
  characters?: ThemeCharacter[] | null;
  feedbackPhrases?: FeedbackPhrases | null;
}

interface ArtworkData {
  introImage: string | null;
  outroImage: string | null;
  backgroundImage: string | null;
  featuredCharacter: ThemeCharacter | null;
}

interface PlayClientProps {
  playerId?: string;
  mission: Mission;
  sentences: Sentence[];
  theme?: ThemeData;
  artwork?: ArtworkData;
}

type GamePhase = "intro" | "playing" | "complete";

// Inner component that uses the word metadata context
function PlayClientInner({ playerId, mission, sentences, theme, artwork }: PlayClientProps) {
  // Load word metadata on mount
  const { loadWords, isLoaded } = useWordMetadata();

  // Collect all unique words from sentences
  const allWords = useMemo(() => {
    const wordSet = new Set<string>();
    sentences.forEach((sentence) => {
      sentence.orderedWords.forEach((w) => wordSet.add(w.toLowerCase()));
      sentence.distractors.forEach((w) => wordSet.add(w.toLowerCase()));
    });
    return Array.from(wordSet);
  }, [sentences]);

  // Load word metadata when component mounts
  useEffect(() => {
    if (allWords.length > 0) {
      loadWords(allWords);
    }
  }, [allWords, loadWords]);
  const router = useRouter();
  const { currentTheme, switchTheme } = useTheme();
  const [gamePhase, setGamePhase] = useState<GamePhase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const { playCelebrateFeedback } = useThemeFeedback();
  const { getCorrectPhrase } = useThemeFeedbackText();

  // Per-sentence tracking for word mastery
  const [sentenceHintsUsed, setSentenceHintsUsed] = useState(0);
  const [sentenceRetries, setSentenceRetries] = useState(0);

  // Track play time
  const playStartTimeRef = useRef<number | null>(null);

  // Switch to the mission's theme if different from current
  useEffect(() => {
    if (theme?.id && currentTheme?.id !== theme.id) {
      switchTheme(theme.id);
    }
  }, [theme?.id, currentTheme?.id, switchTheme]);

  // Get a feedback phrase for the current sentence (memoized per sentence)
  const feedbackPhrase = getCorrectPhrase() || "Great job!";

  const currentSentence = sentences[currentIndex];

  // Save progress when mission completes
  const saveProgress = useCallback(async (stars: number) => {
    if (!playerId) {
      console.warn("No player ID, progress not saved");
      return;
    }

    // Calculate play time
    const playTimeSeconds = playStartTimeRef.current
      ? Math.round((Date.now() - playStartTimeRef.current) / 1000)
      : 0;

    setIsSavingProgress(true);
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          missionId: mission.id,
          starsEarned: stars,
          hintsUsed,
          playTimeSeconds,
        }),
      });

      if (!response.ok) {
        console.error("Failed to save progress:", await response.text());
      } else {
        const data = await response.json();
        console.log("Progress saved:", data);
      }
    } catch (error) {
      console.error("Error saving progress:", error);
    } finally {
      setIsSavingProgress(false);
    }
  }, [playerId, mission.id, hintsUsed]);

  // AI validation function
  const validateSentence = useCallback(
    async (submittedWords: string[]): Promise<boolean> => {
      try {
        const response = await fetch("/api/ai/validate-sentence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submittedWords,
            targetSentence: currentSentence.text,
            availableWords: [
              ...currentSentence.orderedWords,
              ...currentSentence.distractors,
            ],
          }),
        });

        const result = await response.json();
        return result.valid;
      } catch (error) {
        console.error("Validation error:", error);
        // Fallback to simple check
        const submitted = submittedWords
          .join(" ")
          .toLowerCase()
          .replace(" .", ".")
          .replace(" ?", "?");
        const target = currentSentence.text.toLowerCase();
        return submitted === target;
      }
    },
    [currentSentence]
  );

  const handleHintUsed = useCallback(() => {
    setHintsUsed((h) => h + 1);
    setSentenceHintsUsed((h) => h + 1);
  }, []);

  const handleRetry = useCallback(() => {
    setSentenceRetries((r) => r + 1);
  }, []);

  // Track word mastery after sentence completion
  const trackWordMastery = useCallback(
    async (words: string[], hintsUsedForSentence: number, retriesForSentence: number) => {
      if (!playerId) return;

      const correctFirstTry = hintsUsedForSentence === 0 && retriesForSentence === 0;
      const wordPerformances = words.map((word) => ({
        word,
        correctFirstTry,
        neededHint: hintsUsedForSentence > 0,
        neededRetry: retriesForSentence > 0,
      }));

      try {
        await fetch("/api/word-mastery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId,
            words: wordPerformances,
          }),
        });
      } catch (error) {
        console.error("Error tracking word mastery:", error);
      }
    },
    [playerId]
  );

  const handleSentenceComplete = useCallback(() => {
    // Track word mastery for the completed sentence
    trackWordMastery(
      currentSentence.orderedWords,
      sentenceHintsUsed,
      sentenceRetries
    );

    // Reset per-sentence tracking for next sentence
    setSentenceHintsUsed(0);
    setSentenceRetries(0);

    // Move to next sentence or show completion
    if (currentIndex < sentences.length - 1) {
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
      }, 1500);
    } else {
      // Mission complete - save progress and show celebration
      const stars = calculateStars(hintsUsed);
      saveProgress(stars);

      setTimeout(() => {
        playCelebrateFeedback();
        setGamePhase("complete");
      }, 1500);
    }
  }, [
    currentIndex,
    sentences.length,
    playCelebrateFeedback,
    hintsUsed,
    saveProgress,
    currentSentence.orderedWords,
    sentenceHintsUsed,
    sentenceRetries,
    trackWordMastery,
  ]);

  const handleStart = useCallback(() => {
    playStartTimeRef.current = Date.now();
    setGamePhase("playing");
  }, []);

  const handleContinue = useCallback(() => {
    // Navigate back to map
    router.push("/map");
  }, [router]);

  const handleReplay = useCallback(() => {
    // Replay this mission
    setCurrentIndex(0);
    setHintsUsed(0);
    setSentenceHintsUsed(0);
    setSentenceRetries(0);
    playStartTimeRef.current = null;
    setGamePhase("intro");
  }, []);

  // Calculate stars based on hints used
  const starsEarned = calculateStars(hintsUsed);

  return (
    <AnimatePresence mode="wait">
      {/* Mission Intro Phase */}
      {gamePhase === "intro" && (
        <MissionIntro
          key="intro"
          missionTitle={mission.title}
          missionDescription={mission.narrativeIntro || undefined}
          sentenceCount={sentences.length}
          onStart={handleStart}
          introImage={artwork?.introImage || undefined}
          characterImage={artwork?.featuredCharacter?.imageUrl || undefined}
          characterName={artwork?.featuredCharacter?.name}
        />
      )}

      {/* Playing Phase */}
      {gamePhase === "playing" && (
        <motion.div
          key="playing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen p-4 sm:p-6"
          style={{
            background: artwork?.backgroundImage
              ? `linear-gradient(to bottom, rgba(255,255,255,0.85), rgba(255,255,255,0.9)), url(${artwork.backgroundImage}) center/cover no-repeat`
              : "linear-gradient(to bottom, var(--theme-background), var(--theme-secondary))",
          }}
        >
          {/* Header */}
          <div className="max-w-4xl mx-auto mb-4 sm:mb-6">
            <div className="flex items-center justify-between">
              <h1
                className="text-lg sm:text-xl font-bold"
                style={{ color: "var(--theme-text)" }}
              >
                {mission.title}
              </h1>
              <div className="flex items-center gap-3">
                {/* Star potential indicator */}
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={`text-xl sm:text-2xl ${i < starsEarned ? "opacity-100" : "opacity-30"}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                {/* Mute toggle */}
                <MuteToggle size="sm" />
              </div>
            </div>
            {/* Progress bar */}
            <div
              className="mt-2 h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--theme-card-bg)" }}
            >
              <motion.div
                className="h-full"
                style={{ backgroundColor: "var(--theme-primary)" }}
                initial={{ width: 0 }}
                animate={{
                  width: `${(currentIndex / sentences.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div
              className="mt-1 text-sm text-right"
              style={{ color: "var(--theme-text)", opacity: 0.7 }}
            >
              Sentence {currentIndex + 1} of {sentences.length}
            </div>
          </div>

          {/* Sentence Builder */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSentence.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <SentenceBuilder
                orderedWords={currentSentence.orderedWords}
                distractors={currentSentence.distractors}
                onValidate={validateSentence}
                onComplete={handleSentenceComplete}
                onHintUsed={handleHintUsed}
                onRetry={handleRetry}
                hintsUsed={hintsUsed}
                currentSentence={currentIndex + 1}
                totalSentences={sentences.length}
                feedbackPhrase={feedbackPhrase}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {/* Mission Complete Phase */}
      {gamePhase === "complete" && (
        <MissionComplete
          key="complete"
          missionTitle={mission.title}
          starsEarned={starsEarned}
          onContinue={handleContinue}
          outroImage={artwork?.outroImage || undefined}
          characterImage={artwork?.featuredCharacter?.imageUrl || undefined}
          characterName={artwork?.featuredCharacter?.name}
          outroNarrative={mission.narrativeOutro || undefined}
        />
      )}
    </AnimatePresence>
  );
}

// Exported component that wraps with WordMetadataProvider
export function PlayClient(props: PlayClientProps) {
  return (
    <WordMetadataProvider>
      <PlayClientInner {...props} />
    </WordMetadataProvider>
  );
}
