"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { useWordAudio } from "@/lib/audio/useWordAudio";

interface SortableWordCardProps {
  word: string;
  id: string;
  onClick?: () => void;
  disabled?: boolean;
  isHinted?: boolean;
}

export function SortableWordCard({
  word,
  id,
  onClick,
  disabled = false,
  isHinted = false,
}: SortableWordCardProps) {
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
    id,
    data: { word, type: "word-bank" },
    disabled,
    transition: {
      duration: 200,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  // Punctuation gets smaller card and no audio
  const isPunct = /^[.!?]$/.test(word);

  // Audio playback
  const { play } = useWordAudio(word);

  const handleClick = () => {
    if (!isPunct && !disabled) {
      play();
    }
    onClick?.();
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms cubic-bezier(0.25, 1, 0.5, 1)",
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : isOver ? 50 : "auto",
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
        flex items-center justify-center
        rounded-lg sm:rounded-xl
        font-bold text-lg sm:text-xl lg:text-2xl
        select-none
        touch-none
        transition-colors
        ${
          isDragging
            ? "bg-indigo-500 text-white shadow-2xl scale-105"
            : isOver && isSorting
              ? "bg-indigo-100 text-gray-800 shadow-lg ring-2 ring-indigo-300"
              : isHinted
                ? "bg-amber-100 text-amber-800 shadow-lg ring-2 ring-amber-400"
                : "bg-white text-gray-800 shadow-md hover:shadow-lg"
        }
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
      {word}
    </motion.button>
  );
}
