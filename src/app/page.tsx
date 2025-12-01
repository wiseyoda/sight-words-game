"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Baloo_2 } from "next/font/google";
import { useTheme } from "@/lib/theme";
import { usePlayer } from "@/lib/player";
import { ThemePicker } from "@/components/game/ThemePicker";
import { PlayerPicker } from "@/components/game/PlayerPicker";
import { AudioControlsButton } from "@/components/ui/AudioControls";

const displayFont = Baloo_2({ subsets: ["latin"], weight: ["600", "700", "800"] });

// Avatar emoji mapping
const AVATAR_EMOJIS: Record<string, string> = {
  dog: "🐕",
  cat: "🐱",
  rabbit: "🐰",
  bear: "🐻",
  fox: "🦊",
  lion: "🦁",
  unicorn: "🦄",
  dragon: "🐉",
};

function getAvatarEmoji(avatarId: string | null): string {
  return avatarId ? AVATAR_EMOJIS[avatarId] || "👤" : "👤";
}

export default function Home() {
  const { currentTheme, isLoading: isThemeLoading, prefersReducedMotion } = useTheme();
  const { currentPlayer, players, isLoading: isPlayerLoading } = usePlayer();
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showPlayerPicker, setShowPlayerPicker] = useState(false);

  // Show player picker on first load if no players exist
  useEffect(() => {
    if (!isPlayerLoading && players.length === 0) {
      setShowPlayerPicker(true);
    }
  }, [isPlayerLoading, players.length]);

  const isLoading = isThemeLoading || isPlayerLoading;
  const playerName = currentPlayer?.name || "Friend";
  const playerAvatar = getAvatarEmoji(currentPlayer?.avatarId || null);
  const playerStars = currentPlayer?.totalStars || 0;
  const themeName = currentTheme?.displayName || "Adventure";

  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col">
      <Background />

      {/* Top bar - minimal controls */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4">
        <Link
          href="/admin"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/40 hover:bg-white/60 transition-colors text-sm font-medium"
          style={{ color: "var(--theme-text)" }}
        >
          <span className="text-lg">⚙️</span>
          <span className="hidden sm:inline">Settings</span>
        </Link>
        <AudioControlsButton />
      </header>

      {/* Main content - centered hero */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Player greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          {/* Avatar */}
          <motion.button
            onClick={() => setShowPlayerPicker(true)}
            className="relative inline-block mb-4 group"
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          >
            <div
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-6xl sm:text-7xl shadow-2xl border-4 border-white transition-transform"
              style={{
                background: "linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))",
              }}
            >
              {isLoading ? (
                <div className="animate-pulse bg-white/30 w-16 h-16 rounded-full" />
              ) : (
                playerAvatar
              )}
            </div>
            {/* Edit hint */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
              ✏️
            </div>
          </motion.button>

          {/* Greeting */}
          <h1
            className={`${displayFont.className} text-3xl sm:text-4xl md:text-5xl mb-2`}
            style={{ color: "var(--theme-text)" }}
          >
            {isLoading ? (
              <span className="opacity-50">Loading...</span>
            ) : (
              <>Hi, {playerName}!</>
            )}
          </h1>

          {/* Stars display */}
          {!isLoading && playerStars > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 shadow-md"
            >
              <span className="text-2xl">⭐</span>
              <span
                className={`${displayFont.className} text-xl`}
                style={{ color: "var(--theme-primary)" }}
              >
                {playerStars} stars
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center gap-4"
        >
          <Link
            href="/map"
            className="group relative"
          >
            <motion.div
              className="relative px-12 py-6 sm:px-16 sm:py-8 rounded-3xl text-white font-bold text-2xl sm:text-3xl shadow-2xl transition-all"
              style={{
                background: "linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))",
                border: "4px solid white",
              }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -4 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            >
              <span className={`${displayFont.className} flex items-center gap-3`}>
                <span className="text-4xl">▶️</span>
                Play!
              </span>
            </motion.div>
          </Link>

          {/* Theme indicator - tappable */}
          <motion.button
            onClick={() => setShowThemePicker(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/80 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
          >
            <span className="text-xl">🎨</span>
            <span
              className={`${displayFont.className} text-lg`}
              style={{ color: "var(--theme-primary)" }}
            >
              {themeName}
            </span>
            <span className="text-gray-400 text-sm">▼</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Bottom quick actions */}
      <footer className="relative z-10 px-6 pb-6">
        <div className="max-w-md mx-auto flex items-center justify-center gap-4">
          <motion.button
            onClick={() => setShowPlayerPicker(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/70 shadow-md hover:bg-white/90 transition-all"
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
          >
            <span className="text-xl">{playerAvatar}</span>
            <span className="text-sm font-medium" style={{ color: "var(--theme-text)" }}>
              Switch Player
            </span>
          </motion.button>

          <Link
            href="/play"
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/70 shadow-md hover:bg-white/90 transition-all hover:-translate-y-0.5"
          >
            <span className="text-xl">⚡</span>
            <span className="text-sm font-medium" style={{ color: "var(--theme-text)" }}>
              Quick Play
            </span>
          </Link>
        </div>
      </footer>

      {/* Theme Picker Overlay */}
      <ThemePicker
        isOpen={showThemePicker}
        onClose={() => setShowThemePicker(false)}
      />

      {/* Player Picker Overlay */}
      <PlayerPicker
        isOpen={showPlayerPicker}
        onClose={() => setShowPlayerPicker(false)}
      />
    </main>
  );
}

function Background() {
  const { currentTheme } = useTheme();
  const backgroundUrl = currentTheme?.assets?.background || currentTheme?.assets?.mapBackground;
  const logoUrl = currentTheme?.assets?.logo;

  return (
    <>
      {/* Full-screen theme background image */}
      {backgroundUrl ? (
        <div
          className="fixed inset-0"
          style={{
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      ) : (
        /* Fallback gradient if no background image */
        <div
          className="fixed inset-0"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4), transparent 40%),
              radial-gradient(circle at 70% 80%, rgba(255,255,255,0.3), transparent 40%),
              linear-gradient(160deg, var(--theme-background) 0%, var(--theme-secondary) 50%, var(--theme-primary) 100%)
            `,
          }}
        />
      )}

      {/* Overlay for better text readability */}
      {backgroundUrl && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 100%)",
          }}
        />
      )}

      {/* Subtle dot pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(var(--theme-text) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Theme logo watermark - only show if no background image */}
      {!backgroundUrl && logoUrl && (
        <div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: `url(${logoUrl})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* Decorative blurs - softer when background image is present */}
      <div
        className={`fixed -left-32 top-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${backgroundUrl ? "opacity-20" : "opacity-40"}`}
        style={{ background: "var(--theme-primary)" }}
      />
      <div
        className={`fixed -right-32 bottom-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none ${backgroundUrl ? "opacity-20" : "opacity-40"}`}
        style={{ background: "var(--theme-accent)" }}
      />
    </>
  );
}
