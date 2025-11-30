"use client";

import { useEffect, useState, useCallback, useRef } from "react";

// Timing constants for hint system
const INACTIVITY_TIMEOUT_MS = 15000; // 15 seconds before hint button pulses
const HINT_COOLDOWN_MS = 5000; // 5 seconds between hint uses
const RETRY_THRESHOLD = 3; // Number of failed attempts before auto-offer hint
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSentenceStore, type WordCardData } from "@/stores/sentenceStore";
import { useSentenceAudio } from "@/lib/audio/useSentenceAudio";
import { useCelebrateAudio } from "@/lib/audio/useCelebrateAudio";
import { useSoundEffects } from "@/lib/audio/useSoundEffects";
import { correctAnswerCelebration } from "@/lib/effects/confetti";
import { DraggableDroppableSlot } from "./DraggableDroppableSlot";
import { SortableWordCard } from "./SortableWordCard";
import { WordCard } from "./WordCard";

interface SentenceBuilderProps {
  orderedWords: string[];
  distractors: string[];
  scaffoldingLevel?: number;
  onValidate?: (submittedWords: string[]) => Promise<boolean>;
  onComplete?: () => void;
  // Progress tracking
  currentSentence?: number;
  totalSentences?: number;
  // Hint tracking for star calculation
  onHintUsed?: () => void;
  hintsUsed?: number;
  // Audio feedback phrase (combined with sentence TTS)
  feedbackPhrase?: string;
}

// Droppable wrapper for word bank area
function DroppableWordBank({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: "word-bank",
    data: { type: "word-bank" },
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-wrap items-center justify-center gap-3 p-4 rounded-2xl min-h-[80px]
        transition-all duration-150
        ${isOver ? "bg-indigo-50 ring-2 ring-indigo-300 ring-dashed" : ""}
      `}
    >
      {children}
      {isOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute text-indigo-400 text-sm font-medium"
        >
          Drop to return
        </motion.div>
      )}
    </div>
  );
}

function joinWordsToSentence(words: Array<string | WordCardData>): string {
  return words.reduce<string>((acc, word) => {
    const value = typeof word === "string" ? word : word.text;
    if (/^[.!?,]$/.test(value.trim())) {
      return acc + value.trim();
    }
    return acc ? `${acc} ${value}` : value;
  }, "");
}

export function SentenceBuilder({
  orderedWords,
  distractors,
  scaffoldingLevel = 1,
  onValidate,
  onComplete,
  currentSentence = 1,
  totalSentences = 1,
  onHintUsed,
  hintsUsed = 0,
  feedbackPhrase,
}: SentenceBuilderProps) {
  const {
    availableWords,
    slots,
    isValidating,
    validationResult,
    initializeSentence,
    placeWord,
    moveWordToSlot,
    returnWordToBank,
    reorderWordBank,
    clearSlots,
    setValidating,
    setValidationResult,
    getSubmittedSentence,
  } = useSentenceStore();

  const { play: playSentence, isPlaying: isSentencePlaying } = useSentenceAudio();
  const { play: playCelebrate, isPlaying: isCelebratePlaying } = useCelebrateAudio();
  const { playCorrect, playIncorrect, playCelebration } = useSoundEffects();

  // Combined playing state for UI
  const isAudioPlaying = isSentencePlaying || isCelebratePlaying;
  const [playedSentence, setPlayedSentence] = useState<string>("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [hintedWordLocked, setHintedWordLocked] = useState<string | null>(null);
  const [showGhostWords, setShowGhostWords] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [hintCooldown, setHintCooldown] = useState(false);
  const [hintPulsing, setHintPulsing] = useState(false);
  const [showHintPopup, setShowHintPopup] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate disabled state early for use in effects
  const isDisabled = isValidating || validationResult === "correct";

  // Configure sensors with responsive thresholds
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 100, tolerance: 8 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveWord(active.data.current?.wordText as string);
    resetInactivityTimer();
  };

  // Handle drag end - supports all movement types
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveWord(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;
    const activeType = activeData?.type;
    const overType = overData?.type;

    // Scenario 1: Word bank -> Slot (place word)
    if (activeType === "word-bank" && overType === "slot") {
      const wordId = activeData?.wordId as string;
      const slotIndex = overData?.index as number;
      if (wordId && typeof slotIndex === "number") {
        placeWord(wordId, slotIndex);
      }
      return;
    }

    // Scenario 2: Slot -> Slot (move/swap)
    if (activeType === "slot" && overType === "slot") {
      const fromIndex = activeData?.index as number;
      const toIndex = overData?.index as number;
      if (typeof fromIndex === "number" && typeof toIndex === "number" && fromIndex !== toIndex) {
        moveWordToSlot(fromIndex, toIndex);
      }
      return;
    }

    // Scenario 3: Slot -> Word bank (return word)
    if (activeType === "slot" && (overType === "word-bank" || over.id === "word-bank")) {
      const slotIndex = activeData?.index as number;
      if (typeof slotIndex === "number") {
        returnWordToBank(slotIndex);
      }
      return;
    }

    // Scenario 4: Word bank -> Word bank (reorder)
    if (activeType === "word-bank" && overType === "word-bank" && active.id !== over.id) {
      reorderWordBank(active.id as string, over.id as string);
      return;
    }
  };

  // Initialize sentence
  useEffect(() => {
    initializeSentence(orderedWords, distractors, orderedWords.length);
  }, [orderedWords, distractors, initializeSentence]);

  // Reset inactivity timer on user interaction
  const resetInactivityTimer = useCallback(() => {
    setHintPulsing(false);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    // Start inactivity timer
    inactivityTimerRef.current = setTimeout(() => {
      if (!isDisabled && hintLevel < 3) {
        setHintPulsing(true);
      }
    }, INACTIVITY_TIMEOUT_MS);
  }, [isDisabled, hintLevel]);

  // Start inactivity timer on mount and reset on activity
  useEffect(() => {
    resetInactivityTimer();
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, [resetInactivityTimer]);

  // Show hint popup after failed attempts threshold
  useEffect(() => {
    if (retryCount >= RETRY_THRESHOLD && !showHintPopup && hintLevel < 3 && !isDisabled) {
      setShowHintPopup(true);
    }
  }, [retryCount, showHintPopup, hintLevel, isDisabled]);

  // Handle word tap (for quick placement)
  const handleWordTap = (wordId: string) => {
    if (isDisabled) return;
    resetInactivityTimer();
    placeWord(wordId);
  };

  // Handle hint button
  const handleHint = useCallback(() => {
    if (hintLevel >= 3 || hintCooldown) return;

    // Reset inactivity timer and popup state
    resetInactivityTimer();
    setShowHintPopup(false);
    setHintPulsing(false);

    const newLevel = hintLevel + 1;
    setHintLevel(newLevel);
    onHintUsed?.();

    // Start hint cooldown
    setHintCooldown(true);
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
    }
    cooldownTimerRef.current = setTimeout(() => {
      setHintCooldown(false);
    }, HINT_COOLDOWN_MS);

    // Level 1: Highlight the first correct word needed
    if (newLevel === 1) {
      const firstEmptyIndex = slots.findIndex((s) => s === null);
      if (firstEmptyIndex !== -1) {
        const correctWord = orderedWords[firstEmptyIndex];
        // Only set if the word is available in the word bank
        const foundWord = availableWords.find(
          (w) => w.text.toLowerCase() === correctWord?.toLowerCase()
        );
        setHintedWordLocked(foundWord?.id || null);
      }
    }

    // Level 2: Show ghost words in empty slots
    if (newLevel === 2) {
      setShowGhostWords(true);
    }

    // Level 3: Play full sentence audio (all correct words will be highlighted via hintLevel check)
    if (newLevel === 3) {
      playSentence(joinWordsToSentence(orderedWords));
    }
  }, [hintLevel, hintCooldown, onHintUsed, orderedWords, playSentence, slots, availableWords, resetInactivityTimer]);

  // Handle check button
  const handleCheck = async () => {
    const submitted = getSubmittedSentence();
    if (submitted.length !== orderedWords.length) return;

    resetInactivityTimer();
    setValidating(true);

    let isCorrect = false;
    if (onValidate) {
      isCorrect = await onValidate(submitted);
    } else {
      isCorrect = submitted.every(
        (word, i) => word.toLowerCase() === orderedWords[i].toLowerCase()
      );
    }

    setValidationResult(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
      // Play celebration effects (sound effects + confetti)
      playCorrect();
      correctAnswerCelebration();
      playCelebration();

      const actualSentence = joinWordsToSentence(submitted);
      setPlayedSentence(actualSentence);

      // Delay before playing combined TTS (sentence + feedback phrase)
      setTimeout(async () => {
        try {
          // Play combined audio: sentence + optional feedback phrase
          await playCelebrate(actualSentence, feedbackPhrase);
        } catch (error) {
          console.error("Failed to play celebrate audio:", error);
        }
        if (onComplete) {
          setTimeout(onComplete, 500);
        }
      }, 800);
    } else {
      // Play incorrect sound
      playIncorrect();
      setRetryCount(prev => prev + 1);
    }
  };

  const handleTryAgain = () => {
    setValidationResult(null);
    setHintLevel(0);
    setHintedWordLocked(null);
    setShowGhostWords(false);
    setRetryCount(0);
    setShowHintPopup(false);
    setHintPulsing(false);
    setHintCooldown(false);
    resetInactivityTimer();
    clearSlots();
  };

  const handlePlayPreview = async () => {
    if (isAudioPlaying) return;
    const currentWords = slots.filter((s): s is WordCardData => s !== null);
    if (currentWords.length === 0) return;

    const previewSentence = joinWordsToSentence(currentWords);

    await playSentence(previewSentence);
  };

  const allSlotsFilled = slots.every((s) => s !== null);
  const hasAnyWords = slots.some((s) => s !== null);

  // Handler for hint popup dismissal
  const handleDismissHintPopup = () => {
    setShowHintPopup(false);
    resetInactivityTimer();
  };

  // Determine which words to highlight based on hint level
  const hintedWords: Set<string> = new Set();

  if (hintLevel >= 1 && hintLevel < 3 && hintedWordLocked && availableWords.some((w) => w.id === hintedWordLocked)) {
    // Level 1-2: Just the locked word
    hintedWords.add(hintedWordLocked);
  } else if (hintLevel >= 3) {
    // Level 3: All correct words that are still in the word bank (respect duplicate counts)
    const requiredCounts = new Map<string, number>();
    orderedWords.forEach((word) => {
      const key = word.toLowerCase();
      requiredCounts.set(key, (requiredCounts.get(key) ?? 0) + 1);
    });

    const usedCounts = new Map<string, number>();
    availableWords.forEach((word) => {
      const key = word.text.toLowerCase();
      const needed = requiredCounts.get(key) ?? 0;
      const used = usedCounts.get(key) ?? 0;

      if (used < needed) {
        hintedWords.add(word.id);
        usedCounts.set(key, used + 1);
      }
    });
  }

  // Word IDs for sortable context
  const wordIds = availableWords.map((w) => w.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="game-container safe-area-padding flex flex-col items-center gap-4 sm:gap-6 lg:gap-8 p-3 sm:p-4 lg:p-6 w-full max-w-4xl mx-auto">
        {/* Progress Indicator */}
        {totalSentences > 1 && (
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm font-medium">
              Sentence {currentSentence} of {totalSentences}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: totalSentences }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < currentSentence - 1
                      ? "bg-emerald-400"
                      : i === currentSentence - 1
                        ? "bg-indigo-500"
                        : "bg-gray-300"
                  }`}
                  initial={false}
                  animate={
                    i === currentSentence - 1
                      ? { scale: [1, 1.2, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.5, repeat: i === currentSentence - 1 ? Infinity : 0, repeatDelay: 1 }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Sentence Slots */}
        <div className="bg-white/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg w-full">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {slots.map((word, index) => (
              <DraggableDroppableSlot
                key={index}
                id={`slot-${index}`}
                word={word}
                index={index}
                isFirst={index === 0}
                isPunctuation={orderedWords[index]?.match(/^[.!?]$/) !== null}
                ghostWord={showGhostWords ? orderedWords[index] : undefined}
                validationState={validationResult}
                disabled={isDisabled}
                onRemove={returnWordToBank}
              />
            ))}
          </div>

          {/* Play Preview Button */}
          <div className="flex justify-center mt-4">
            <motion.button
              onClick={handlePlayPreview}
              disabled={!hasAnyWords || isAudioPlaying}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm
                ${
                  !hasAnyWords || isAudioPlaying
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                }
              `}
              whileHover={hasAnyWords && !isAudioPlaying ? { scale: 1.05 } : {}}
              whileTap={hasAnyWords && !isAudioPlaying ? { scale: 0.95 } : {}}
            >
              {isAudioPlaying ? (
                <>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    🔊
                  </motion.span>
                  Playing...
                </>
              ) : (
                <>
                  <span className="text-lg">🔊</span>
                  Hear my sentence
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Word Bank - Sortable and Droppable */}
        <DroppableWordBank disabled={isDisabled}>
          <SortableContext items={wordIds} strategy={horizontalListSortingStrategy}>
            {availableWords.map((word) => (
              <SortableWordCard
                key={word.id}
                wordId={word.id}
                wordText={word.text}
                onClick={() => handleWordTap(word.id)}
                disabled={isDisabled}
                isHinted={hintedWords.has(word.id)}
              />
            ))}
          </SortableContext>
          {availableWords.length === 0 && !isDisabled && (
            <span className="text-gray-400 text-sm">
              Drag words here to remove them
            </span>
          )}
        </DroppableWordBank>

        {/* Hint Popup */}
        <AnimatePresence>
          {showHintPopup && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-50 bg-black/30"
              onClick={handleDismissHintPopup}
            >
              <motion.div
                className="bg-white rounded-2xl p-6 shadow-xl max-w-sm mx-4"
                onClick={(e) => e.stopPropagation()}
                initial={{ y: 20 }}
                animate={{ y: 0 }}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Would you like a little help?
                </h3>
                <p className="text-gray-600 mb-4">
                  It looks like this is tricky! Want me to show you a hint?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleHint();
                      setShowHintPopup(false);
                    }}
                    className="flex-1 px-4 py-3 bg-amber-100 text-amber-700 font-bold rounded-xl hover:bg-amber-200 transition-colors"
                  >
                    Yes! 💡
                  </button>
                  <button
                    onClick={handleDismissHintPopup}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    I got it!
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-wrap justify-center">
          {/* Hint Button */}
          <motion.button
            onClick={handleHint}
            disabled={isDisabled || hintLevel >= 3 || hintCooldown}
            className={`
              px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base lg:text-lg flex items-center gap-1 sm:gap-2 relative
              ${
                isDisabled || hintLevel >= 3 || hintCooldown
                  ? "bg-amber-100 text-amber-300 cursor-not-allowed"
                  : "bg-amber-100 text-amber-700 hover:bg-amber-200"
              }
            `}
            whileHover={!isDisabled && hintLevel < 3 && !hintCooldown ? { scale: 1.02 } : {}}
            whileTap={!isDisabled && hintLevel < 3 && !hintCooldown ? { scale: 0.98 } : {}}
            animate={
              hintPulsing && !isDisabled && hintLevel < 3
                ? { scale: [1, 1.05, 1], boxShadow: ["0 0 0 0 rgba(251, 191, 36, 0)", "0 0 0 8px rgba(251, 191, 36, 0.3)", "0 0 0 0 rgba(251, 191, 36, 0)"] }
                : {}
            }
            transition={hintPulsing ? { duration: 1.5, repeat: Infinity } : {}}
          >
            <span className="text-xl">💡</span>
            <span>
              {hintCooldown
                ? "Wait..."
                : hintLevel === 0
                  ? "Hint"
                  : hintLevel === 1
                    ? "More Hint"
                    : hintLevel === 2
                      ? "Hear It"
                      : "No More Hints"}
            </span>
            {hintLevel > 0 && hintLevel < 3 && !hintCooldown && (
              <span className="ml-1 text-xs bg-amber-200 px-1.5 py-0.5 rounded">
                {3 - hintLevel} left
              </span>
            )}
          </motion.button>

          <motion.button
            onClick={handleTryAgain}
            disabled={isDisabled}
            className={`
              px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base lg:text-lg
              ${
                isDisabled
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Clear
          </motion.button>

          <motion.button
            onClick={handleCheck}
            disabled={!allSlotsFilled || isDisabled}
            className={`
              px-5 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base lg:text-lg text-white
              ${
                !allSlotsFilled || isDisabled
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
              isAudioPlaying ? "🔊 Playing..." : "Correct! ✓"
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
              ? isAudioPlaying
                ? `🔊 "${playedSentence}"`
                : "Great job! You did it!"
              : "Almost there! Try again!"}
          </motion.div>
        )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeWord ? (
          <WordCard word={activeWord} isSelected playAudio={false} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
