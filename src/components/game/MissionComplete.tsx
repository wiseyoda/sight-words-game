"use client";

import { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useSoundEffects } from "@/lib/audio/useSoundEffects";
import { celebrationBurst, starBurst } from "@/lib/effects/confetti";
import { getStarMessage } from "@/lib/game/starCalculation";
import { useAutoPlayUIText } from "@/lib/audio/useUITextAudio";

interface MissionCompleteProps {
  missionTitle: string;
  starsEarned: 1 | 2 | 3;
  onContinue: () => void;
  onStoryMap?: () => void;
  unlockMessage?: string;
}

export function MissionComplete({
  missionTitle,
  starsEarned,
  onContinue,
  onStoryMap,
  unlockMessage,
}: MissionCompleteProps) {
  const { playCelebration, playStar, playFanfare } = useSoundEffects();
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Build celebration announcement for TTS
  const celebrationText = useMemo(() => {
    const starMessage = getStarMessage(starsEarned);
    let text = `Mission Complete! ${missionTitle}. ${starMessage}`;
    if (unlockMessage) {
      text += ` ${unlockMessage}`;
    }
    return text;
  }, [missionTitle, starsEarned, unlockMessage]);

  // Auto-play TTS celebration after star animations (delay to let audio effects play)
  useAutoPlayUIText(celebrationText, "celebrate", 2200);

  // Trigger celebration effects on mount
  useEffect(() => {
    // Clear any existing timeouts
    timeoutsRef.current = [];

    celebrationBurst();
    playFanfare();

    // Play star sounds with delay
    const starDelays = [500, 900, 1300];
    starDelays.slice(0, starsEarned).forEach((delay) => {
      const timeout = setTimeout(() => {
        playStar();
        starBurst();
      }, delay);
      timeoutsRef.current.push(timeout);
    });

    // Final celebration
    const celebrationTimeout = setTimeout(() => {
      playCelebration();
    }, 1800);
    timeoutsRef.current.push(celebrationTimeout);

    // Cleanup on unmount
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [starsEarned, playCelebration, playStar, playFanfare]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-b from-emerald-100 to-yellow-100 flex items-center justify-center p-8 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center"
      >
        {/* Trophy badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"
        >
          <span className="text-5xl">🏆</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-gray-800 mb-2"
        >
          Mission Complete!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-600 mb-6"
        >
          {missionTitle}
        </motion.p>

        {/* Stars */}
        <motion.div className="flex justify-center gap-4 mb-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, y: -50 }}
              animate={{
                opacity: i < starsEarned ? 1 : 0.2,
                scale: 1,
                y: 0,
              }}
              transition={{
                delay: 0.5 + i * 0.3,
                type: "spring",
                stiffness: 300,
                damping: 15,
              }}
              className="relative"
            >
              <span className="text-6xl">{i < starsEarned ? "⭐" : "☆"}</span>
              {i < starsEarned && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 0] }}
                  transition={{ delay: 0.5 + i * 0.3, duration: 0.5 }}
                  className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl"
                />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Star message */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="text-xl font-bold text-emerald-600 mb-6"
        >
          {getStarMessage(starsEarned)}
        </motion.p>

        {/* Unlock message */}
        {unlockMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8 }}
            className="bg-purple-100 text-purple-700 px-6 py-3 rounded-xl mb-6 font-medium"
          >
            🎉 {unlockMessage}
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            onClick={onContinue}
            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xl font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue
          </motion.button>

          {onStoryMap && (
            <motion.button
              onClick={onStoryMap}
              className="bg-white border-2 border-indigo-300 text-indigo-600 text-xl font-bold px-8 py-4 rounded-2xl shadow hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Story Map
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
