"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";

interface DraggableDroppableSlotProps {
  id: string;
  word: string | null;
  index: number;
  isFirst?: boolean;
  isPunctuation?: boolean;
  ghostWord?: string;
  validationState?: "correct" | "incorrect" | null;
  disabled?: boolean;
}

export function DraggableDroppableSlot({
  id,
  word,
  index,
  isFirst = false,
  isPunctuation = false,
  ghostWord,
  validationState,
  disabled = false,
}: DraggableDroppableSlotProps) {
  // Droppable for receiving words
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: `droppable-${id}`,
    data: { index, type: "slot" },
    disabled: validationState === "correct",
  });

  // Draggable for moving placed words
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `draggable-${id}`,
    data: { word, index, type: "slot" },
    disabled: !word || disabled || validationState === "correct",
  });

  // Display word with proper capitalization
  const displayWord = word
    ? isFirst
      ? word.charAt(0).toUpperCase() + word.slice(1)
      : word.toLowerCase()
    : null;

  // Punctuation gets smaller slot
  const slotWidth = isPunctuation ? "w-[48px]" : "w-[80px]";

  const draggableStyle = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1000 : undefined,
  };

  return (
    <motion.div
      ref={setDroppableRef}
      className={`
        ${slotWidth} h-[60px]
        flex items-center justify-center
        rounded-xl
        transition-all duration-150
        ${
          validationState === "correct"
            ? "ring-4 ring-emerald-400 bg-emerald-50"
            : validationState === "incorrect"
              ? "ring-4 ring-red-400 bg-red-50"
              : isOver
                ? "ring-4 ring-indigo-400 bg-indigo-50 scale-105"
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
      {!word && ghostWord && !isOver && (
        <span className="text-gray-300 text-xl font-medium select-none">
          {isFirst
            ? ghostWord.charAt(0).toUpperCase() + ghostWord.slice(1)
            : ghostWord}
        </span>
      )}

      {/* Drop indicator */}
      {isOver && !word && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-indigo-400 text-3xl"
        >
          ↓
        </motion.div>
      )}

      {/* Swap indicator when hovering over filled slot */}
      {isOver && word && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-indigo-200/50 rounded-xl z-10 flex items-center justify-center"
        >
          <span className="text-indigo-600 text-lg">⇄</span>
        </motion.div>
      )}

      {/* Placed word - now draggable */}
      <AnimatePresence mode="wait">
        {displayWord && !isDragging && (
          <motion.div
            ref={setDraggableRef}
            style={draggableStyle}
            {...listeners}
            {...attributes}
            key={displayWord}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`
              absolute inset-0 flex items-center justify-center
              ${isPunctuation ? "min-w-[48px] px-3" : "min-w-[80px] px-4"}
              h-[60px]
              rounded-xl
              font-bold text-2xl
              select-none
              touch-none
              bg-white text-gray-800 shadow-sm
              ${validationState === "correct" ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
            `}
          >
            {displayWord}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
