"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SentenceBuilder } from "@/components/game";

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

export function PlayClient({ mission, sentences }: PlayClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [showComplete, setShowComplete] = useState(false);

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

  const handleComplete = () => {
    setCompletedCount((c) => c + 1);

    // Move to next sentence or show completion
    if (currentIndex < sentences.length - 1) {
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
      }, 1500);
    } else {
      setTimeout(() => {
        setShowComplete(true);
      }, 1500);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCompletedCount(0);
    setShowComplete(false);
    setShowIntro(true);
  };

  // Intro screen
  if (showIntro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-100 to-purple-100 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-lg text-center"
        >
          <h1 className="text-3xl font-bold text-indigo-600 mb-4">
            {mission.title}
          </h1>
          {mission.narrativeIntro && (
            <p className="text-lg text-gray-600 mb-8">{mission.narrativeIntro}</p>
          )}
          <p className="text-gray-500 mb-6">
            {sentences.length} sentences to build
          </p>
          <motion.button
            onClick={() => setShowIntro(false)}
            className="px-8 py-4 bg-indigo-500 text-white text-xl font-bold rounded-xl hover:bg-indigo-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start!
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Completion screen
  if (showComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-100 to-teal-100 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-lg text-center"
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            ⭐
          </motion.div>
          <h1 className="text-3xl font-bold text-emerald-600 mb-4">
            Amazing Job!
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            You completed all {sentences.length} sentences!
          </p>
          <p className="text-2xl font-bold text-emerald-500 mb-8">
            ⭐⭐⭐
          </p>
          <motion.button
            onClick={handleRestart}
            className="px-8 py-4 bg-emerald-500 text-white text-xl font-bold rounded-xl hover:bg-emerald-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Play Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Game screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">{mission.title}</h1>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">
              Sentence {currentIndex + 1} of {sentences.length}
            </span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-indigo-500"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentIndex + (completedCount > currentIndex ? 1 : 0)) / sentences.length) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
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
            scaffoldingLevel={1}
            onValidate={validateSentence}
            onComplete={handleComplete}
          />
        </motion.div>
      </AnimatePresence>

      {/* Target sentence hint (for development) */}
      <div className="max-w-4xl mx-auto mt-6 text-center">
        <p className="text-sm text-gray-400">
          Target: {currentSentence.text}
        </p>
      </div>
    </div>
  );
}
