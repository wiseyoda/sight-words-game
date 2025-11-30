"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useCallback } from "react";

interface ImagePreviewModalProps {
  imageUrl: string | null;
  wordText: string | null;
  onClose: () => void;
}

export function ImagePreviewModal({ imageUrl, wordText, onClose }: ImagePreviewModalProps) {
  // Handle escape key press
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (imageUrl) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [imageUrl, handleKeyDown]);

  return (
    <AnimatePresence>
      {imageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Image preview for ${wordText}`}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2, type: "spring", damping: 25 }}
            className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
              aria-label="Close preview"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Image */}
            <div className="aspect-square bg-gray-100 flex items-center justify-center p-4">
              <img
                src={imageUrl}
                alt={wordText || "Word image"}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>

            {/* Word label */}
            {wordText && (
              <div className="p-4 bg-gradient-to-t from-gray-50 to-white border-t border-gray-100">
                <p className="text-center text-2xl font-bold text-gray-800">
                  {wordText}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
