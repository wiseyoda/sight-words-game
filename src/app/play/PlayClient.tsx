"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SentenceBuilder, MissionIntro, MissionComplete } from "@/components/game";
import { calculateStars } from "@/lib/game/starCalculation";
import { useTheme } from "@/lib/theme";
import { useThemeFeedback, useThemeFeedbackText } from "@/lib/audio/useThemeFeedback";
import type { ThemeCharacter, FeedbackPhrases } from "@/lib/db/schema";

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

interface PlayClientProps {
  playerId?: string;
  mission: Mission;
  sentences: Sentence[];
  theme?: ThemeData;
}

type GamePhase = "intro" | "playing" | "complete";

export function PlayClient({ playerId, mission, sentences, theme }: PlayClientProps) {
  const router = useRouter();
  const { currentTheme, switchTheme } = useTheme();
  const [gamePhase, setGamePhase] = useState<GamePhase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const { playCelebrateFeedback } = useThemeFeedback();
  const { getCorrectPhrase } = useThemeFeedbackText();

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
  }, []);

  const handleSentenceComplete = useCallback(() => {
    // Audio feedback is now combined with sentence TTS in SentenceBuilder
    // No separate playCorrectFeedback() call needed

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
  }, [currentIndex, sentences.length, playCelebrateFeedback, hintsUsed, saveProgress]);

  const handleStart = useCallback(() => {
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
            background: "linear-gradient(to bottom, var(--theme-background), var(--theme-secondary))",
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
              <div className="flex items-center gap-2">
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
        />
      )}
    </AnimatePresence>
  );
}
