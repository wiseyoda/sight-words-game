"use client";

import { motion, AnimatePresence } from "framer-motion";
import { WordCard } from "./WordCard";

interface SlotProps {
  word: string | null;
  index: number;
  isFirst?: boolean;
  isPunctuation?: boolean;
  ghostWord?: string;
  validationState?: "correct" | "incorrect" | null;
  onRemove?: () => void;
}

export function Slot({
  word,
  index,
  isFirst = false,
  isPunctuation = false,
  ghostWord,
  validationState,
  onRemove,
}: SlotProps) {
  // Display word with proper capitalization
  const displayWord = word
    ? isFirst
      ? word.charAt(0).toUpperCase() + word.slice(1)
      : word.toLowerCase()
    : null;

  // Punctuation gets smaller slot
  const slotWidth = isPunctuation ? "w-[48px]" : "w-[80px]";

  return (
    <motion.div
      className={`
        ${slotWidth} h-[60px]
        flex items-center justify-center
        rounded-xl
        ${
          validationState === "correct"
            ? "ring-4 ring-emerald-400 bg-emerald-50"
            : validationState === "incorrect"
              ? "ring-4 ring-red-400 bg-red-50"
              : word
                ? "bg-transparent"
                : "border-2 border-dashed border-gray-300 bg-gray-50"
        }
        relative
      `}
      initial={false}
      animate={
        validationState === "incorrect"
          ? {
              x: [0, -8, 8, -8, 8, 0],
              transition: { duration: 0.4 },
            }
          : {}
      }
    >
      {/* Ghost word hint (scaffolding level 1) */}
      {!word && ghostWord && (
        <span className="text-gray-300 text-xl font-medium select-none">
          {isFirst
            ? ghostWord.charAt(0).toUpperCase() + ghostWord.slice(1)
            : ghostWord}
        </span>
      )}

      {/* Placed word */}
      <AnimatePresence mode="wait">
        {displayWord && (
          <motion.div
            key={displayWord}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <WordCard
              word={displayWord}
              isPlaced
              isPunctuation={isPunctuation}
              onClick={onRemove}
              disabled={validationState === "correct"}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
