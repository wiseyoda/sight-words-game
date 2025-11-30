"use client";

import Link from "next/link";
import { useTheme } from "@/lib/theme";

export default function Home() {
  const { currentTheme, isLoading } = useTheme();

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-8"
      style={{
        background: `linear-gradient(to bottom, var(--theme-background), var(--theme-secondary))`,
      }}
    >
      <div className="text-center space-y-8 max-w-2xl">
        {/* Hero */}
        <div className="space-y-4">
          <h1
            className="text-5xl md:text-7xl font-bold"
            style={{ color: "var(--theme-primary)" }}
          >
            {currentTheme?.displayName || "Sight Words Adventure"}
          </h1>
          <p
            className="text-xl md:text-2xl"
            style={{ color: "var(--theme-text)" }}
          >
            {currentTheme
              ? "Join the adventure and learn to read!"
              : "Learn to read with your favorite characters!"}
          </p>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="text-lg" style={{ color: "var(--theme-text)" }}>
            Loading adventure...
          </div>
        )}

        {/* Play Buttons */}
        {!isLoading && (
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            {/* Story Map Button - Primary */}
            <Link
              href="/map"
              className="inline-block px-12 py-6 text-white text-2xl font-bold rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))`,
              }}
            >
              Start Adventure
            </Link>

            {/* Quick Play Button - Secondary */}
            <Link
              href="/play"
              className="inline-block px-8 py-4 text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              style={{
                backgroundColor: "var(--theme-card-bg)",
                color: "var(--theme-primary)",
                border: "2px solid var(--theme-primary)",
              }}
            >
              Quick Play
            </Link>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
          <div
            className="rounded-2xl p-6 shadow-lg"
            style={{ backgroundColor: "var(--theme-card-bg)" }}
          >
            <div className="text-4xl mb-2">📚</div>
            <h3 className="font-bold" style={{ color: "var(--theme-text)" }}>
              Build Sentences
            </h3>
            <p className="text-sm" style={{ color: "var(--theme-text)", opacity: 0.7 }}>
              Tap words to create sentences
            </p>
          </div>
          <div
            className="rounded-2xl p-6 shadow-lg"
            style={{ backgroundColor: "var(--theme-card-bg)" }}
          >
            <div className="text-4xl mb-2">⭐</div>
            <h3 className="font-bold" style={{ color: "var(--theme-text)" }}>
              Earn Stars
            </h3>
            <p className="text-sm" style={{ color: "var(--theme-text)", opacity: 0.7 }}>
              Complete missions to earn rewards
            </p>
          </div>
          <div
            className="rounded-2xl p-6 shadow-lg"
            style={{ backgroundColor: "var(--theme-card-bg)" }}
          >
            <div className="text-4xl mb-2">🎯</div>
            <h3 className="font-bold" style={{ color: "var(--theme-text)" }}>
              {currentTheme?.characters?.length
                ? `Meet ${currentTheme.characters.length} Characters`
                : "Learn 133 Words"}
            </h3>
            <p className="text-sm" style={{ color: "var(--theme-text)", opacity: 0.7 }}>
              {currentTheme?.characters?.length
                ? "Play with your favorite heroes"
                : "Master the Dolch sight word list"}
            </p>
          </div>
        </div>

        {/* Theme Characters Preview */}
        {currentTheme?.characters && currentTheme.characters.length > 0 && (
          <div className="pt-4">
            <p
              className="text-sm mb-3"
              style={{ color: "var(--theme-text)", opacity: 0.7 }}
            >
              Featuring:
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              {currentTheme.characters.map((char) => (
                <span
                  key={char.id}
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: "var(--theme-special)",
                    color: "var(--theme-text)",
                  }}
                >
                  {char.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-8 space-y-2">
          <p className="text-sm" style={{ color: "var(--theme-text)", opacity: 0.5 }}>
            For young readers ages 4-6
          </p>
          <Link
            href="/admin"
            className="text-xs hover:opacity-100 transition"
            style={{ color: "var(--theme-text)", opacity: 0.4 }}
          >
            Parent Dashboard →
          </Link>
        </div>
      </div>
    </main>
  );
}
