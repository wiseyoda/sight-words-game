"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSentenceStore } from "@/stores/sentenceStore";
import { WordCard } from "./WordCard";
import { Slot } from "./Slot";

interface SentenceBuilderProps {
  // The correct sentence words in order (e.g., ["The", "dog", "can", "run", "."])
  orderedWords: string[];
  // Distractor words to add to word bank
  distractors: string[];
  // Scaffolding level (1-4)
  scaffoldingLevel?: number;
  // Callback when sentence is validated
  onValidate?: (submittedWords: string[]) => Promise<boolean>;
  // Callback when sentence is correct
  onComplete?: () => void;
}

export function SentenceBuilder({
  orderedWords,
  distractors,
  scaffoldingLevel = 1,
  onValidate,
  onComplete,
}: SentenceBuilderProps) {
  const {
    availableWords,
    slots,
    selectedWord,
    isValidating,
    validationResult,
    initializeSentence,
    placeWord,
    removeWord,
    selectWord,
    clearSlots,
    setValidating,
    setValidationResult,
    getSubmittedSentence,
  } = useSentenceStore();

  // Initialize sentence on mount or when props change
  useEffect(() => {
    initializeSentence(orderedWords, distractors, orderedWords.length);
  }, [orderedWords, distractors, initializeSentence]);

  // Handle word tap in bank
  const handleWordTap = (word: string) => {
    if (isValidating || validationResult === "correct") return;

    // Place the word in the first empty slot
    placeWord(word);
  };

  // Handle slot tap (remove word)
  const handleSlotTap = (index: number) => {
    if (isValidating || validationResult === "correct") return;
    removeWord(index);
  };

  // Handle check button
  const handleCheck = async () => {
    const submitted = getSubmittedSentence();

    // Need all slots filled
    if (submitted.length !== orderedWords.length) {
      return;
    }

    setValidating(true);

    if (onValidate) {
      const isCorrect = await onValidate(submitted);
      setValidationResult(isCorrect ? "correct" : "incorrect");

      if (isCorrect && onComplete) {
        // Small delay for celebration animation
        setTimeout(onComplete, 1000);
      }
    } else {
      // Simple fallback: check exact match (case-insensitive)
      const isCorrect = submitted.every(
        (word, i) => word.toLowerCase() === orderedWords[i].toLowerCase()
      );
      setValidationResult(isCorrect ? "correct" : "incorrect");

      if (isCorrect && onComplete) {
        setTimeout(onComplete, 1000);
      }
    }
  };

  // Handle try again
  const handleTryAgain = () => {
    setValidationResult(null);
    clearSlots();
  };

  // Check if all slots are filled
  const allSlotsFilled = slots.every((s) => s !== null);

  return (
    <div className="flex flex-col items-center gap-8 p-6 w-full max-w-4xl mx-auto">
      {/* Sentence Slots */}
      <div className="bg-white/80 rounded-2xl p-6 shadow-lg w-full">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {slots.map((word, index) => (
            <Slot
              key={index}
              word={word}
              index={index}
              isFirst={index === 0}
              isPunctuation={orderedWords[index]?.match(/^[.!?]$/) !== null}
              ghostWord={scaffoldingLevel === 1 ? orderedWords[index] : undefined}
              validationState={validationResult}
              onRemove={() => handleSlotTap(index)}
            />
          ))}
        </div>
      </div>

      {/* Word Bank */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {availableWords.map((word) => (
          <WordCard
            key={word}
            word={word}
            onClick={() => handleWordTap(word)}
            isSelected={selectedWord === word}
            disabled={isValidating || validationResult === "correct"}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {/* Clear Button */}
        <motion.button
          onClick={handleTryAgain}
          disabled={isValidating || validationResult === "correct"}
          className={`
            px-6 py-3 rounded-xl font-bold text-lg
            ${
              isValidating || validationResult === "correct"
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Clear
        </motion.button>

        {/* Check Button */}
        <motion.button
          onClick={handleCheck}
          disabled={!allSlotsFilled || isValidating || validationResult === "correct"}
          className={`
            px-8 py-3 rounded-xl font-bold text-lg text-white
            ${
              !allSlotsFilled || isValidating || validationResult === "correct"
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-500 hover:bg-indigo-600"
            }
          `}
          whileHover={allSlotsFilled && !isValidating ? { scale: 1.02 } : {}}
          whileTap={allSlotsFilled && !isValidating ? { scale: 0.98 } : {}}
        >
          {isValidating ? (
            <span className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                ⏳
              </motion.span>
              Checking...
            </span>
          ) : validationResult === "correct" ? (
            "Correct! ✓"
          ) : (
            "Check"
          )}
        </motion.button>
      </div>

      {/* Feedback Message */}
      {validationResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            text-xl font-bold p-4 rounded-xl
            ${
              validationResult === "correct"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }
          `}
        >
          {validationResult === "correct"
            ? "Great job! You did it!"
            : "Almost there! Try again!"}
        </motion.div>
      )}
    </div>
  );
}
