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
  onRemove?: (index: number) => void;
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
  onRemove,
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

  // Punctuation gets smaller slot - responsive sizing
  const slotWidth = isPunctuation
    ? "w-[36px] sm:w-[42px] lg:w-[48px]"
    : "w-[60px] sm:w-[70px] lg:w-[80px]";

  const draggableStyle = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1000 : undefined,
  };

  return (
    <motion.div
      ref={setDroppableRef}
      className={`
        ${slotWidth} h-[44px] sm:h-[52px] lg:h-[60px]
        flex items-center justify-center
        rounded-lg sm:rounded-xl
        transition-all duration-150
        ${
          validationState === "correct"
            ? "bg-emerald-50"
            : validationState === "incorrect"
              ? "bg-red-50"
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
        validationState === "correct"
          ? {
              boxShadow: [
                "0 0 0 4px rgba(16, 185, 129, 0.6)",
                "0 0 20px 4px rgba(16, 185, 129, 0.4)",
                "0 0 0 4px rgba(16, 185, 129, 0.6)",
              ],
              transition: { duration: 1, repeat: 2 },
            }
          : validationState === "incorrect"
            ? {
                x: [0, -10, 10, -10, 10, -5, 5, 0],
                boxShadow: "0 0 0 4px rgba(239, 68, 68, 0.5)",
                transition: { duration: 0.5, ease: "easeInOut" },
              }
            : { boxShadow: "none" }
      }
    >
      {/* Ghost word hint (scaffolding level 1) */}
      {!word && ghostWord && !isOver && (
        <span className="text-gray-300 text-base sm:text-lg lg:text-xl font-medium select-none">
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

      {/* Placed word - now draggable with click-to-remove */}
      <AnimatePresence mode="wait">
        {displayWord && !isDragging && (
          <motion.div
            ref={setDraggableRef}
            style={draggableStyle}
            {...listeners}
            {...attributes}
            key={displayWord}
            onClick={(e) => {
              // Only trigger removal if not disabled and validation hasn't passed
              if (!disabled && validationState !== "correct" && onRemove) {
                e.stopPropagation();
                onRemove(index);
              }
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`
              absolute inset-0 flex items-center justify-center
              ${isPunctuation ? "min-w-[36px] sm:min-w-[42px] lg:min-w-[48px] px-2 sm:px-2.5 lg:px-3" : "min-w-[60px] sm:min-w-[70px] lg:min-w-[80px] px-2.5 sm:px-3 lg:px-4"}
              h-[44px] sm:h-[52px] lg:h-[60px]
              rounded-lg sm:rounded-xl
              font-bold text-lg sm:text-xl lg:text-2xl
              select-none
              touch-none
              bg-white text-gray-800 shadow-sm
              ${validationState === "correct" ? "cursor-default" : "cursor-pointer active:cursor-grabbing"}
            `}
          >
            {displayWord}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
