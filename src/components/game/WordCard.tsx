"use client";

import { motion } from "framer-motion";
import { useWordAudio } from "@/lib/audio/useWordAudio";

interface WordCardProps {
  word: string;
  onClick?: () => void;
  isSelected?: boolean;
  isPlaced?: boolean;
  isPunctuation?: boolean;
  disabled?: boolean;
  playAudio?: boolean;
}

export function WordCard({
  word,
  onClick,
  isSelected = false,
  isPlaced = false,
  isPunctuation = false,
  disabled = false,
  playAudio = true,
}: WordCardProps) {
  // Punctuation gets smaller card and no audio
  const isPunct = isPunctuation || /^[.!?]$/.test(word);

  // Audio playback
  const { play } = useWordAudio(word);

  const handleClick = () => {
    // Play audio on tap (unless punctuation or disabled)
    if (!isPunct && playAudio && !disabled) {
      play();
    }

    // Call original onClick handler
    onClick?.();
  };

  return (
    <motion.button
      onClick={handleClick}
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
      whileHover={disabled ? {} : { scale: 1.05, boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.2)" }}
      whileTap={disabled ? {} : { scale: 0.9, boxShadow: "0 2px 10px -2px rgba(0, 0, 0, 0.15)" }}
      initial={false}
      animate={isSelected ? { y: -4 } : { y: 0 }}
      layout
    >
      {word}
    </motion.button>
  );
}
