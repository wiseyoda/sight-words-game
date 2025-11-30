"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import { useWordAudio } from "@/lib/audio/useWordAudio";
import { DEFAULT_WORD_COLORS } from "@/lib/words/word-types";
import { useWordMetadata } from "@/lib/words/WordMetadataContext";

export type WordType = "sight" | "character" | "other";

interface SortableWordCardProps {
  wordId: string;
  wordText: string;
  onClick?: () => void;
  disabled?: boolean;
  isHinted?: boolean;
  isCharacter?: boolean;
  /** Word type for color coding: "sight" (learning target), "character" (theme character), "other" (filler/distractor) */
  wordType?: WordType;
  /** Emoji to display inline with the word (only for non-sight words) */
  emoji?: string | null;
  /** Image URL - shows small thumbnail, click to enlarge */
  imageUrl?: string | null;
  /** Callback when image preview is requested */
  onImagePreview?: (imageUrl: string, wordText: string) => void;
}

export function SortableWordCard({
  wordId,
  wordText,
  onClick,
  disabled = false,
  isHinted = false,
  isCharacter = false,
  wordType: wordTypeProp,
  emoji: emojiProp,
  imageUrl: imageUrlProp,
  onImagePreview,
}: SortableWordCardProps) {
  // Get word metadata from context (if available)
  const { getWordMetadata } = useWordMetadata();
  const metadata = getWordMetadata(wordText);

  // Use props first, then fall back to metadata
  const emoji = emojiProp ?? metadata?.emoji ?? null;
  const imageUrl = imageUrlProp ?? metadata?.imageUrl ?? null;
  const wordType = wordTypeProp ?? metadata?.wordType ?? (isCharacter ? "character" : "other");

  // Determine effective word type
  const effectiveWordType: WordType = wordType;

  // Check if this word should show a visual (only non-sight words)
  const isSightWord = effectiveWordType === "sight";
  const hasEmoji = !isSightWord && emoji && !imageUrl;
  const hasImage = !isSightWord && !!imageUrl;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
    isSorting,
  } = useSortable({
    id: wordId,
    data: { wordId, wordText, type: "word-bank" },
    disabled,
    transition: {
      duration: 200,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  // Punctuation gets smaller card and no audio
  const isPunct = /^[.!?]$/.test(wordText);

  // Audio playback
  const { play } = useWordAudio(wordText);

  const handleClick = () => {
    if (!isPunct && !disabled) {
      play();
    }
    onClick?.();
  };

  // Get card background/text styles using word type colors with theme integration
  const getCardColorStyles = (): React.CSSProperties => {
    if (isDragging) {
      return {
        backgroundColor: "var(--theme-primary)",
        color: "white",
      };
    }
    if (isOver && isSorting) {
      return {
        backgroundColor: "var(--theme-card-bg)",
        color: "var(--theme-text)",
        boxShadow: "0 0 0 2px var(--theme-primary)",
      };
    }
    if (isHinted) {
      return {
        backgroundColor: "var(--theme-accent, #fef3c7)",
        color: "var(--theme-text)",
        boxShadow: "0 0 0 2px var(--theme-accent, #fbbf24)",
      };
    }

    // Apply word type colors
    const typeColors = DEFAULT_WORD_COLORS[effectiveWordType];

    if (effectiveWordType === "sight") {
      // Sight words: colored background (amber tones)
      return {
        backgroundColor: typeColors.background,
        color: typeColors.text,
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: typeColors.border,
      };
    }

    if (effectiveWordType === "character") {
      // Character words: theme special color border
      return {
        backgroundColor: "var(--theme-card-bg)",
        color: "var(--theme-text)",
        boxShadow: "0 0 0 3px var(--theme-special, #8b5cf6)",
      };
    }

    // Other words: white/neutral background
    return {
      backgroundColor: typeColors.background,
      color: typeColors.text,
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: typeColors.border,
    };
  };

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms cubic-bezier(0.25, 1, 0.5, 1)",
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : isOver ? 50 : "auto",
    ...getCardColorStyles(),
  };

  return (
    <motion.button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      disabled={disabled}
      className={`
        ${isPunct ? "min-w-[36px] sm:min-w-[42px] lg:min-w-[48px] px-2 sm:px-2.5 lg:px-3" : "min-w-[60px] sm:min-w-[70px] lg:min-w-[80px] px-2.5 sm:px-3 lg:px-4"}
        h-[44px] sm:h-[52px] lg:h-[60px]
        flex items-center justify-center gap-1.5
        rounded-lg sm:rounded-xl
        font-bold text-lg sm:text-xl lg:text-2xl
        select-none
        touch-none
        transition-colors
        shadow-md hover:shadow-lg
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-grab active:cursor-grabbing"}
      `}
      animate={
        isHinted && !isDragging
          ? {
              x: [0, -3, 3, -3, 3, 0, 0, 0, 0, 0, -3, 3, -3, 3, 0],
            }
          : {}
      }
      transition={isHinted && !isDragging ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : undefined}
      whileHover={disabled || isDragging ? {} : { scale: 1.05, boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.2)" }}
      whileTap={disabled || isDragging ? {} : { scale: 0.9, boxShadow: "0 2px 10px -2px rgba(0, 0, 0, 0.15)" }}
      layout={!isDragging}
    >
      {/* Emoji displayed inline before word - only for non-sight words without images */}
      {hasEmoji && (
        <span className="text-base sm:text-lg lg:text-xl leading-none flex-shrink-0">
          {emoji}
        </span>
      )}

      {/* Image thumbnail - click to enlarge - only for non-sight words with images */}
      {hasImage && imageUrl && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onImagePreview?.(imageUrl, wordText);
          }}
          className="flex-shrink-0 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 rounded"
          aria-label={`View larger image for ${wordText}`}
        >
          <img
            src={imageUrl}
            alt={wordText}
            className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 object-cover rounded"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </button>
      )}

      {/* Word text */}
      <span>{wordText}</span>
    </motion.button>
  );
}
