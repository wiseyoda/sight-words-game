"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useAutoPlayUIText } from "@/lib/audio/useUITextAudio";

interface MissionIntroProps {
  missionTitle: string;
  missionDescription?: string;
  characterImage?: string;
  sentenceCount: number;
  onStart: () => void;
}

export function MissionIntro({
  missionTitle,
  missionDescription,
  characterImage,
  sentenceCount,
  onStart,
}: MissionIntroProps) {
  // Build announcement text for TTS
  const announcementText = missionDescription
    ? `${missionTitle}. ${missionDescription}`
    : missionTitle;

  // Auto-play TTS for mission intro announcement
  useAutoPlayUIText(announcementText, "encourage", 800);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center p-8 z-50"
      style={{
        background: "linear-gradient(to bottom, var(--theme-background), var(--theme-secondary, #8b5cf6)20)",
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center"
        style={{ backgroundColor: "var(--theme-card-bg)" }}
      >
        {/* Mission badge or character image */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg overflow-hidden"
          style={{
            background: characterImage ? "white" : "linear-gradient(to bottom right, var(--theme-primary), var(--theme-secondary))",
          }}
        >
          {characterImage ? (
            <Image
              src={characterImage}
              alt="Character"
              width={80}
              height={80}
              className="object-cover"
            />
          ) : (
            <span className="text-4xl">📖</span>
          )}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-3"
          style={{ color: "var(--theme-text)" }}
        >
          {missionTitle}
        </motion.h1>

        {/* Description */}
        {missionDescription && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-600 mb-6"
          >
            {missionDescription}
          </motion.p>
        )}

        {/* Sentence count */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 text-gray-500 mb-8"
        >
          <span className="text-2xl">✏️</span>
          <span className="text-lg font-medium">
            {sentenceCount} sentence{sentenceCount !== 1 ? "s" : ""} to build
          </span>
        </motion.div>

        {/* Potential stars */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-2 mb-8"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.3, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="text-4xl"
            >
              ⭐
            </motion.span>
          ))}
        </motion.div>

        {/* Start button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          onClick={onStart}
          className="text-white text-xl font-bold px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
          style={{
            background: "linear-gradient(to right, var(--theme-primary), var(--theme-secondary))",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Let&apos;s Go!
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
