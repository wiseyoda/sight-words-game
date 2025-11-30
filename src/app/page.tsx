"use client";

import Link from "next/link";
import { useTheme } from "@/lib/theme";

export default function Home() {
  const { currentTheme, isLoading } = useTheme();

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8"
      style={{
        background: `linear-gradient(to bottom, var(--theme-background), var(--theme-secondary))`,
      }}
    >
      {/* Main Content */}
      <div className="text-center space-y-8 max-w-2xl w-full">
        {/* Title */}
        <div className="space-y-2">
          <h1
            className="text-5xl md:text-7xl font-black tracking-tight"
            style={{
              color: "var(--theme-primary)",
              textShadow: "3px 3px 0px white, 6px 6px 12px rgba(0,0,0,0.1)",
            }}
          >
            {currentTheme?.displayName || "Sight Words"}
          </h1>
          <p
            className="text-xl md:text-2xl font-bold"
            style={{ color: "var(--theme-text)", opacity: 0.8 }}
          >
            Learn to read with your favorite characters!
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div
            className="text-lg animate-pulse"
            style={{ color: "var(--theme-text)" }}
          >
            Loading adventure...
          </div>
        )}

        {/* Play Buttons */}
        {!isLoading && (
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            {/* Main Play Button */}
            <Link
              href="/map"
              className="inline-flex items-center justify-center gap-3 px-12 py-6 text-white text-2xl md:text-3xl font-black rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))`,
              }}
            >
              <span className="text-3xl">▶️</span>
              Start Adventure
            </Link>

            {/* Quick Play Button */}
            <Link
              href="/play"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              style={{
                backgroundColor: "var(--theme-card-bg)",
                color: "var(--theme-primary)",
                border: "3px solid var(--theme-primary)",
              }}
            >
              Quick Play
            </Link>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
          <FeatureCard
            emoji="📚"
            title="Build Sentences"
            description="Tap words to create sentences"
          />
          <FeatureCard
            emoji="⭐"
            title="Earn Stars"
            description="Complete missions to earn rewards"
          />
          <FeatureCard
            emoji="🎯"
            title={
              currentTheme?.characters?.length
                ? `${currentTheme.characters.length} Characters`
                : "133 Words"
            }
            description={
              currentTheme?.characters?.length
                ? "Play with your favorite heroes"
                : "Master the Dolch sight word list"
            }
          />
        </div>

        {/* Character Preview */}
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
          <p
            className="text-sm"
            style={{ color: "var(--theme-text)", opacity: 0.5 }}
          >
            For young readers ages 4-6
          </p>
          <Link
            href="/admin"
            className="text-xs hover:opacity-100 transition"
            style={{ color: "var(--theme-text)", opacity: 0.4 }}
          >
            Parent Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

// Simple feature card component
function FeatureCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div
      className="rounded-2xl p-6 shadow-lg"
      style={{ backgroundColor: "var(--theme-card-bg)" }}
    >
      <div className="text-4xl mb-2">{emoji}</div>
      <h3 className="font-bold" style={{ color: "var(--theme-text)" }}>
        {title}
      </h3>
      <p
        className="text-sm"
        style={{ color: "var(--theme-text)", opacity: 0.7 }}
      >
        {description}
      </p>
    </div>
  );
}
