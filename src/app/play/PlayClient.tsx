"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SentenceBuilder, MissionIntro, MissionComplete } from "@/components/game";
import { calculateStars } from "@/lib/game/starCalculation";

interface Mission {
  id: string;
  title: string;
  narrativeIntro: string | null;
}

interface Sentence {
  id: string;
  text: string;
  orderedWords: string[];
  distractors: string[];
}

interface PlayClientProps {
  mission: Mission;
  sentences: Sentence[];
}

type GamePhase = "intro" | "playing" | "complete";

export function PlayClient({ mission, sentences }: PlayClientProps) {
  const [gamePhase, setGamePhase] = useState<GamePhase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

  const currentSentence = sentences[currentIndex];

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
    // Move to next sentence or show completion
    if (currentIndex < sentences.length - 1) {
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
      }, 1500);
    } else {
      setTimeout(() => {
        setGamePhase("complete");
      }, 1500);
    }
  }, [currentIndex, sentences.length]);

  const handleStart = useCallback(() => {
    setGamePhase("playing");
  }, []);

  const handleContinue = useCallback(() => {
    // Reset for replay
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
          className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4 sm:p-6"
        >
          {/* Header */}
          <div className="max-w-4xl mx-auto mb-4 sm:mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">{mission.title}</h1>
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
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500"
                initial={{ width: 0 }}
                animate={{
                  width: `${(currentIndex / sentences.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="mt-1 text-sm text-gray-500 text-right">
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
