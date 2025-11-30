"use client";

import Link from "next/link";
import { Baloo_2, Space_Grotesk } from "next/font/google";
import { useTheme } from "@/lib/theme";

const displayFont = Baloo_2({ subsets: ["latin"], weight: ["600", "700", "800"] });
const accentFont = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"] });

export default function Home() {
  const { currentTheme, isLoading, prefersReducedMotion } = useTheme();

  const heroTitle = currentTheme?.displayName || "Sight Words Adventure";
  const heroTagline = currentTheme
    ? `Jump into ${currentTheme.displayName} and build sentences with friends.`
    : "Build confident readers with playful, theme-filled missions.";

  const characterNames = currentTheme?.characters?.map((char) => char.name) || [];
  const missionLabel = currentTheme?.name?.toLowerCase().includes("paw")
    ? "13-mission map"
    : "Story map progression";
  const audioLabel = currentTheme?.feedbackPhrases?.correct?.length
    ? `${currentTheme.feedbackPhrases.correct.length} cheer tracks`
    : "Playful feedback audio";

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 pt-14 pb-16 space-y-12">
        <section className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] items-center">
          <div className="space-y-6">
            <p
              className={`${accentFont.className} inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full bg-white/80 border border-white/60 shadow-sm text-slate-700`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: "var(--theme-primary)" }}
              />
              {currentTheme ? "Live theme enabled" : "Theme loading"}
            </p>

            <h1
              className={`${displayFont.className} text-5xl md:text-6xl leading-tight text-slate-900 drop-shadow-sm`}
              style={{
                textShadow: "0 10px 35px rgba(0,0,0,0.12)",
                color: "var(--theme-primary)",
              }}
            >
              {heroTitle}
            </h1>
            <p
              className={`${accentFont.className} text-lg md:text-xl text-slate-800 max-w-2xl`}
              style={{ color: "var(--theme-text)" }}
            >
              {heroTagline}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/map"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-white text-xl font-extrabold rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-1"
                style={{
                  background: "linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))",
                  border: "3px solid white",
                }}
              >
                <span className={`text-3xl ${!prefersReducedMotion ? "group-hover:animate-wiggle" : ""}`}>&gt;</span>
                Start Adventure
              </Link>
              <Link
                href="/play"
                className="inline-flex items-center justify-center px-6 py-4 text-base font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-1 bg-white"
                style={{
                  color: "var(--theme-primary)",
                  border: "3px solid var(--theme-primary)",
                }}
              >
                Quick Play
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center justify-center px-6 py-4 text-base font-semibold rounded-2xl transition-all border border-transparent text-slate-700 hover:-translate-y-1"
                style={{ color: "var(--theme-text)" }}
              >
                Parent Dashboard
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatPill label={missionLabel} value="Map to boss mission" />
              <StatPill label={audioLabel} value="Positive feedback" />
              <StatPill
                label={characterNames.length ? `${characterNames.length} characters` : "Sight words"}
                value={characterNames.length ? "Character cards" : "133+ words"}
              />
            </div>
          </div>

          <ThemeCard
            title={heroTitle}
            characterNames={characterNames}
            missionLabel={missionLabel}
            audioLabel={audioLabel}
            isLoading={isLoading}
            backgroundImage={currentTheme?.assets?.background}
            mapBackground={currentTheme?.assets?.mapBackground}
          />
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            emoji="🧩"
            title="Sentence Builder"
            description="Drag, tap, and snap words into place with friendly hints that scale as kids improve."
          />
          <FeatureCard
            emoji="🗺️"
            title="Story Map"
            description="Unlock missions, treasure stops, and a boss finale that match the theme's story."
          />
          <FeatureCard
            emoji="🔊"
            title="Theme Audio"
            description="Pre-recorded cheers and music keep energy high while staying classroom-friendly."
          />
        </section>

        <section className="grid gap-4 md:grid-cols-[1.3fr,0.7fr] items-start">
          <div className="p-6 rounded-3xl bg-white/80 border border-white/60 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className={`${displayFont.className} text-2xl text-slate-900`}>
                Upcoming Themes
              </h2>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 text-white">
                Phase 4
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <ThemePeek
                name="Bluey"
                vibe="Backyard adventures, cozy colors"
                colors={["#6fb4e6", "#f6c59d"]}
                status="In build next"
              />
              <ThemePeek
                name="Marvel"
                vibe="Bold hero missions, tower finale"
                colors={["#d62828", "#1a2d63"]}
                status="Queued"
              />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-white/90 to-slate-50 shadow-lg border border-white/60">
            <h2 className={`${displayFont.className} text-2xl text-slate-900 mb-3`}>
              Built for parents
            </h2>
            <ul className={`${accentFont.className} space-y-3 text-sm text-slate-700`}>
              <li>- Progress saves per theme and player.</li>
              <li>- Reduced-motion friendly animations.</li>
              <li>- Audio toggles and volume balance tuned for kids.</li>
              <li>- Admin dashboard ready for content review.</li>
            </ul>
            <Link
              href="/admin"
              className="mt-4 inline-flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-xl bg-slate-900 text-white shadow-md hover:-translate-y-1 transition-transform"
            >
              Open Parent Dashboard
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function Background() {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6), transparent 30%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.55), transparent 25%), radial-gradient(circle at 50% 100%, rgba(255,255,255,0.4), transparent 30%), linear-gradient(135deg, var(--theme-background), var(--theme-secondary))",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-25"
        style={{
          backgroundImage: "radial-gradient(var(--theme-text) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="absolute -left-20 top-10 w-72 h-72 rounded-full blur-3xl opacity-60"
        style={{ background: "var(--theme-primary)" }}
      />
      <div
        className="absolute -right-16 bottom-10 w-64 h-64 rounded-full blur-3xl opacity-60"
        style={{ background: "var(--theme-accent)" }}
      />
    </>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm text-left">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</p>
      <p className={`${displayFont.className} text-lg text-slate-900`} style={{ color: "var(--theme-primary)" }}>
        {value}
      </p>
    </div>
  );
}

function ThemeCard({
  title,
  characterNames,
  missionLabel,
  audioLabel,
  isLoading,
  backgroundImage,
  mapBackground,
}: {
  title: string;
  characterNames: string[];
  missionLabel: string;
  audioLabel: string;
  isLoading: boolean;
  backgroundImage?: string;
  mapBackground?: string;
}) {
  const hasCharacters = characterNames.length > 0;
  return (
    <div className="relative overflow-hidden rounded-[32px] border-4 border-white shadow-2xl bg-white/80 backdrop-blur">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: backgroundImage
            ? `linear-gradient(180deg, rgba(255,255,255,0.75), rgba(255,255,255,0.9)), url(${backgroundImage})`
            : "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 flex items-center justify-center rounded-2xl bg-white shadow-md text-xl">
            🎮
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-600">{isLoading ? "Loading theme..." : "Theme snapshot"}</p>
            <p className={`${displayFont.className} text-xl text-slate-900`} style={{ color: "var(--theme-primary)" }}>
              {title}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <StatBlock label="Journey" value={missionLabel} />
          <StatBlock label="Audio" value={audioLabel} />
          <StatBlock
            label="Background"
            value={mapBackground ? "Map-ready art" : "Using default sky"}
          />
          <StatBlock
            label="Accessibility"
            value="Reduced-motion friendly"
          />
        </div>

        {hasCharacters && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600">Characters</p>
            <div className="flex flex-wrap gap-2">
              {characterNames.map((name) => (
                <span
                  key={name}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-white shadow-sm border border-white/70"
                  style={{ color: "var(--theme-text)", backgroundColor: "var(--theme-special)" }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Link
            href="/map"
            className="inline-flex items-center justify-center px-4 py-3 text-sm font-bold rounded-xl text-white shadow-lg transition-transform hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))",
              border: "2px solid white",
            }}
          >
            View Story Map
          </Link>
          <Link
            href="/play"
            className="text-sm font-semibold text-slate-700 hover:-translate-y-0.5 transition-transform"
            style={{ color: "var(--theme-text)" }}
          >
            Jump into a mission →
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/80 border border-white/60 p-3 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">{label}</p>
      <p className="text-sm font-bold text-slate-900" style={{ color: "var(--theme-text)" }}>
        {value}
      </p>
    </div>
  );
}

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
    <div className="group rounded-3xl p-6 shadow-lg border border-white/70 bg-white/80 backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className={`${displayFont.className} text-xl text-slate-900 mb-2`}>{title}</h3>
      <p className={`${accentFont.className} text-sm text-slate-700 leading-relaxed`}>{description}</p>
    </div>
  );
}

function ThemePeek({
  name,
  vibe,
  colors,
  status,
}: {
  name: string;
  vibe: string;
  colors: string[];
  status: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/70 shadow-md p-4 text-left"
      style={{
        background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
      }}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div className="relative space-y-1 text-white drop-shadow-sm">
        <div className="text-xs font-semibold uppercase">{status}</div>
        <div className={`${displayFont.className} text-xl`}>{name}</div>
        <div className="text-sm opacity-90">{vibe}</div>
      </div>
    </div>
  );
}
