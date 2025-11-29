"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { useWordAudio } from "@/lib/audio/useWordAudio";

interface DraggableWordCardProps {
  word: string;
  id: string;
  onClick?: () => void;
  isSelected?: boolean;
  disabled?: boolean;
}

export function DraggableWordCard({
  word,
  id,
  onClick,
  isSelected = false,
  disabled = false,
}: DraggableWordCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { word },
      disabled,
    });

  // Punctuation gets smaller card and no audio
  const isPunct = /^[.!?]$/.test(word);

  // Audio playback
  const { play } = useWordAudio(word);

  const handleClick = () => {
    // Play audio on tap (unless punctuation or disabled)
    if (!isPunct && !disabled) {
      play();
    }
    onClick?.();
  };

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1000 : undefined,
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
        ${isPunct ? "min-w-[48px] px-3" : "min-w-[80px] px-4"}
        h-[60px]
        flex items-center justify-center
        rounded-xl
        font-bold text-2xl
        select-none
        touch-none
        transition-colors
        ${
          isDragging
            ? "bg-indigo-500 text-white shadow-2xl scale-105"
            : isSelected
              ? "bg-indigo-500 text-white ring-4 ring-indigo-300"
              : "bg-white text-gray-800 shadow-md hover:shadow-lg"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-grab active:cursor-grabbing"}
      `}
      whileHover={disabled || isDragging ? {} : { scale: 1.02 }}
      whileTap={disabled || isDragging ? {} : { scale: 0.95 }}
      initial={false}
      animate={isSelected && !isDragging ? { y: -4 } : { y: 0 }}
      layout={!isDragging}
    >
      {word}
    </motion.button>
  );
}
