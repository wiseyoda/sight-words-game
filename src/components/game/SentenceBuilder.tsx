"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
import { useSentenceStore } from "@/stores/sentenceStore";
import { useSentenceAudio } from "@/lib/audio/useSentenceAudio";
import { DraggableDroppableSlot } from "./DraggableDroppableSlot";
import { SortableWordCard } from "./SortableWordCard";
import { WordCard } from "./WordCard";

interface SentenceBuilderProps {
  orderedWords: string[];
  distractors: string[];
  scaffoldingLevel?: number;
  onValidate?: (submittedWords: string[]) => Promise<boolean>;
  onComplete?: () => void;
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
    moveWordToSlot,
    returnWordToBank,
    reorderWordBank,
    selectWord,
    clearSlots,
    setValidating,
    setValidationResult,
    getSubmittedSentence,
  } = useSentenceStore();

  const { play: playSentence, isPlaying: isSentencePlaying } = useSentenceAudio();
  const [playedSentence, setPlayedSentence] = useState<string>("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeWord, setActiveWord] = useState<string | null>(null);

  // Configure sensors
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 150, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveWord(active.data.current?.word as string);
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
      const word = activeData?.word as string;
      const slotIndex = overData?.index as number;
      if (word && typeof slotIndex === "number") {
        placeWord(word, slotIndex);
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

  // Handle word tap (for quick placement)
  const handleWordTap = (word: string) => {
    if (isValidating || validationResult === "correct") return;
    placeWord(word);
  };

  // Handle check button
  const handleCheck = async () => {
    const submitted = getSubmittedSentence();
    if (submitted.length !== orderedWords.length) return;

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
      const actualSentence = submitted.reduce((acc, word) => {
        if (/^[.!?,]$/.test(word)) return acc + word;
        return acc ? acc + " " + word : word;
      }, "");

      setPlayedSentence(actualSentence);
      await playSentence(actualSentence);

      if (onComplete) {
        setTimeout(onComplete, 500);
      }
    }
  };

  const handleTryAgain = () => {
    setValidationResult(null);
    clearSlots();
  };

  const handlePlayPreview = async () => {
    if (isSentencePlaying) return;
    const currentWords = slots.filter((s): s is string => s !== null);
    if (currentWords.length === 0) return;

    const previewSentence = currentWords.reduce((acc, word) => {
      if (/^[.!?,]$/.test(word)) return acc + word;
      return acc ? acc + " " + word : word;
    }, "");

    await playSentence(previewSentence);
  };

  const allSlotsFilled = slots.every((s) => s !== null);
  const hasAnyWords = slots.some((s) => s !== null);
  const isDisabled = isValidating || validationResult === "correct";

  // Word IDs for sortable context
  const wordIds = availableWords.map((w) => `word-${w}`);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col items-center gap-8 p-6 w-full max-w-4xl mx-auto">
        {/* Sentence Slots */}
        <div className="bg-white/80 rounded-2xl p-6 shadow-lg w-full">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {slots.map((word, index) => (
              <DraggableDroppableSlot
                key={index}
                id={`slot-${index}`}
                word={word}
                index={index}
                isFirst={index === 0}
                isPunctuation={orderedWords[index]?.match(/^[.!?]$/) !== null}
                ghostWord={scaffoldingLevel === 1 ? orderedWords[index] : undefined}
                validationState={validationResult}
                disabled={isDisabled}
              />
            ))}
          </div>

          {/* Play Preview Button */}
          <div className="flex justify-center mt-4">
            <motion.button
              onClick={handlePlayPreview}
              disabled={!hasAnyWords || isSentencePlaying}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm
                ${
                  !hasAnyWords || isSentencePlaying
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                }
              `}
              whileHover={hasAnyWords && !isSentencePlaying ? { scale: 1.05 } : {}}
              whileTap={hasAnyWords && !isSentencePlaying ? { scale: 0.95 } : {}}
            >
              {isSentencePlaying ? (
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
                key={word}
                id={`word-${word}`}
                word={word}
                onClick={() => handleWordTap(word)}
                disabled={isDisabled}
              />
            ))}
          </SortableContext>
          {availableWords.length === 0 && !isDisabled && (
            <span className="text-gray-400 text-sm">
              Drag words here to remove them
            </span>
          )}
        </DroppableWordBank>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <motion.button
            onClick={handleTryAgain}
            disabled={isDisabled}
            className={`
              px-6 py-3 rounded-xl font-bold text-lg
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
              px-8 py-3 rounded-xl font-bold text-lg text-white
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
              isSentencePlaying ? "🔊 Playing..." : "Correct! ✓"
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
              ? isSentencePlaying
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
