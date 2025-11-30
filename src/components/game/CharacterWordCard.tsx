"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useWordAudio } from "@/lib/audio/useWordAudio";
import type { ThemeCharacter } from "@/lib/db/schema";

interface CharacterWordCardProps {
  character: ThemeCharacter;
  onClick?: () => void;
  isSelected?: boolean;
  isPlaced?: boolean;
  disabled?: boolean;
  playAudio?: boolean;
}

export function CharacterWordCard({
  character,
  onClick,
  isSelected = false,
  isPlaced = false,
  disabled = false,
  playAudio = true,
}: CharacterWordCardProps) {
  // Audio playback for character name
  const { play } = useWordAudio(character.name);

  const handleClick = () => {
    if (playAudio && !disabled) {
      play();
    }
    onClick?.();
  };

  // Use theme CSS variables for colors
  const getCardStyles = () => {
    if (isSelected) {
      return {
        backgroundColor: "var(--theme-primary)",
        borderColor: "var(--theme-special)",
      };
    }
    return {
      backgroundColor: "var(--theme-card-bg)",
      borderColor: "var(--theme-special)",
    };
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      style={getCardStyles()}
      className={`
        min-w-[100px] px-3 py-2
        flex flex-col items-center justify-center gap-1
        rounded-xl
        font-bold
        select-none
        transition-colors
        border-3
        ${isPlaced ? "shadow-sm" : "shadow-lg hover:shadow-xl"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      whileHover={disabled ? {} : { scale: 1.05, boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.25)" }}
      whileTap={disabled ? {} : { scale: 0.9 }}
      initial={false}
      animate={isSelected ? { y: -4 } : { y: 0 }}
      layout
    >
      {/* Character portrait */}
      <div className="w-12 h-12 relative rounded-full overflow-hidden bg-white/50">
        {character.thumbnailUrl ? (
          <Image
            src={character.thumbnailUrl}
            alt={character.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            👤
          </div>
        )}
      </div>

      {/* Character name */}
      <span
        className="text-lg"
        style={{ color: isSelected ? "white" : "var(--theme-text)" }}
      >
        {character.name}
      </span>
    </motion.button>
  );
}
