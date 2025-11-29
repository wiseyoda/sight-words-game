"use client";

import { motion } from "framer-motion";

interface WordCardProps {
  word: string;
  onClick?: () => void;
  isSelected?: boolean;
  isPlaced?: boolean;
  isPunctuation?: boolean;
  disabled?: boolean;
}

export function WordCard({
  word,
  onClick,
  isSelected = false,
  isPlaced = false,
  isPunctuation = false,
  disabled = false,
}: WordCardProps) {
  // Punctuation gets smaller card
  const isPunct = isPunctuation || /^[.!?]$/.test(word);

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${isPunct ? "min-w-[48px] px-3" : "min-w-[80px] px-4"}
        h-[60px]
        flex items-center justify-center
        rounded-xl
        font-bold text-2xl
        select-none
        transition-colors
        ${
          isSelected
            ? "bg-indigo-500 text-white ring-4 ring-indigo-300"
            : isPlaced
              ? "bg-white text-gray-800 shadow-sm"
              : "bg-white text-gray-800 shadow-md hover:shadow-lg"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      initial={false}
      animate={isSelected ? { y: -4 } : { y: 0 }}
      layout
    >
      {word}
    </motion.button>
  );
}
