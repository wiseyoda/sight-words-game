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
  variant?: "default" | "character";
}

export function WordCard({
  word,
  onClick,
  isSelected = false,
  isPlaced = false,
  isPunctuation = false,
  disabled = false,
  playAudio = true,
  variant = "default",
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

  // Use theme CSS variables for colors
  const getCardStyles = () => {
    if (isSelected) {
      return {
        backgroundColor: "var(--theme-primary)",
        color: "white",
        boxShadow: "0 0 0 4px var(--theme-primary, #6366f1)33",
      };
    }
    if (variant === "character") {
      return {
        backgroundColor: "var(--theme-card-bg)",
        color: "var(--theme-text)",
        boxShadow: "0 0 0 3px var(--theme-special)",
      };
    }
    return {
      backgroundColor: "var(--theme-card-bg)",
      color: "var(--theme-text)",
    };
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      style={getCardStyles()}
      className={`
        ${isPunct ? "min-w-[48px] px-3" : "min-w-[80px] px-4"}
        h-[60px]
        flex items-center justify-center
        rounded-xl
        font-bold text-2xl
        select-none
        transition-colors
        ${isPlaced ? "shadow-sm" : "shadow-md hover:shadow-lg"}
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
