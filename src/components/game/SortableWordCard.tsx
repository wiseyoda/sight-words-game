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
}

export function SortableWordCard({
  word,
  id,
  onClick,
  disabled = false,
}: SortableWordCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { word, type: "word-bank" },
    disabled,
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
    transition,
    opacity: isDragging ? 0.5 : 1,
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
            ? "bg-indigo-500 text-white shadow-2xl"
            : "bg-white text-gray-800 shadow-md hover:shadow-lg"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-grab active:cursor-grabbing"}
      `}
      whileHover={disabled || isDragging ? {} : { scale: 1.02 }}
      whileTap={disabled || isDragging ? {} : { scale: 0.95 }}
      layout={!isDragging}
    >
      {word}
    </motion.button>
  );
}
