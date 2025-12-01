"use client";

import { motion } from "framer-motion";
import { MuteToggle } from "@/components/ui/AudioControls";

export type MapNodeType = "play" | "treasure" | "minigame" | "boss";

export interface MapNode {
  id: string;
  type: MapNodeType;
  title: string;
  unlocked: boolean;
  completed: boolean;
  starsEarned?: 1 | 2 | 3;
  isCurrent?: boolean;
}

interface StoryMapProps {
  campaignTitle: string;
  nodes: MapNode[];
  onNodeTap: (nodeId: string) => void;
  onBack?: () => void;
}

function getNodeEmoji(type: MapNodeType, completed: boolean): string {
  if (type === "treasure") return completed ? "🎁" : "🎁";
  if (type === "minigame") return "🎮";
  if (type === "boss") return "👑";
  return "⭐";
}

function StarDisplay({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <span key={i} className="text-xs">
          {i < count ? "⭐" : "☆"}
        </span>
      ))}
    </div>
  );
}

export function StoryMap({
  campaignTitle,
  nodes,
  onNodeTap,
  onBack,
}: StoryMapProps) {
  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: "var(--theme-map-bg, none), linear-gradient(to bottom, var(--theme-background), var(--theme-primary, #87CEEB))",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        {onBack && (
          <motion.button
            onClick={onBack}
            className="px-4 py-2 rounded-xl font-bold shadow"
            style={{
              backgroundColor: "var(--theme-card-bg)",
              color: "var(--theme-text)",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back
          </motion.button>
        )}
        <h1
          className="text-2xl font-bold px-6 py-2 rounded-xl shadow"
          style={{
            backgroundColor: "var(--theme-card-bg)",
            color: "var(--theme-text)",
          }}
        >
          {campaignTitle}
        </h1>
        <MuteToggle size="md" />
      </div>

      {/* Map Path */}
      <div className="relative max-w-4xl mx-auto">
        {/* Connection lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        >
          {nodes.map((node, i) => {
            if (i === 0) return null;
            const prevNode = nodes[i - 1];
            const x1 = 80 + ((i - 1) % 5) * 160;
            const y1 = 80 + Math.floor((i - 1) / 5) * 140;
            const x2 = 80 + (i % 5) * 160;
            const y2 = 80 + Math.floor(i / 5) * 140;

            // Handle row wrap
            const isRowStart = i % 5 === 0;
            const isEvenRow = Math.floor(i / 5) % 2 === 0;

            if (isRowStart && i > 0) {
              // Connect to node directly above
              return (
                <motion.path
                  key={`path-${i}`}
                  d={`M ${isEvenRow ? 720 : 80} ${y1} L ${isEvenRow ? 720 : 80} ${y2 - 60} L ${x2} ${y2 - 60} L ${x2} ${y2 - 30}`}
                  stroke={node.unlocked ? "var(--theme-primary)" : "var(--theme-text)"}
                  strokeOpacity={node.unlocked ? 1 : 0.3}
                  strokeWidth={4}
                  strokeDasharray={node.unlocked ? "0" : "10 5"}
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                />
              );
            }

            return (
              <motion.line
                key={`path-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={node.unlocked ? "var(--theme-primary)" : "var(--theme-text)"}
                strokeOpacity={node.unlocked ? 1 : 0.3}
                strokeWidth={4}
                strokeDasharray={node.unlocked ? "0" : "10 5"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        <div className="relative flex flex-wrap justify-center gap-8 p-4">
          {nodes.map((node, i) => {
            const isEvenRow = Math.floor(i / 5) % 2 === 0;
            const rowPosition = isEvenRow ? i % 5 : 4 - (i % 5);

            return (
              <motion.button
                key={node.id}
                onClick={() => node.unlocked && onNodeTap(node.id)}
                disabled={!node.unlocked}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
                className="relative w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-all"
                style={{
                  backgroundColor: !node.unlocked
                    ? "var(--theme-card-bg)"
                    : node.completed
                      ? "var(--theme-success)"
                      : node.isCurrent
                        ? "var(--theme-primary)"
                        : "var(--theme-card-bg)",
                  opacity: !node.unlocked ? 0.5 : 1,
                  cursor: node.unlocked ? "pointer" : "not-allowed",
                  order: Math.floor(i / 5) * 100 + rowPosition,
                }}
                whileHover={node.unlocked ? { scale: 1.1 } : {}}
                whileTap={node.unlocked ? { scale: 0.95 } : {}}
              >
                {/* Lock overlay for locked nodes */}
                {!node.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
                    <span className="text-2xl">🔒</span>
                  </div>
                )}

                {/* Node content */}
                <span className="text-3xl">
                  {getNodeEmoji(node.type, node.completed)}
                </span>

                {/* Stars for completed play/boss nodes */}
                {node.completed && node.starsEarned && (node.type === "play" || node.type === "boss") && (
                  <StarDisplay count={node.starsEarned} />
                )}

                {/* Current node indicator */}
                {node.isCurrent && node.unlocked && (
                  <motion.div
                    className="absolute -inset-2 border-4 rounded-3xl"
                    style={{ borderColor: "var(--theme-special, var(--theme-accent))" }}
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [1, 0.8, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div
        className="fixed bottom-4 left-4 rounded-xl p-4 shadow-lg"
        style={{ backgroundColor: "var(--theme-card-bg)" }}
      >
        <h3
          className="font-bold text-sm mb-2"
          style={{ color: "var(--theme-text)" }}
        >
          Legend
        </h3>
        <div
          className="flex flex-col gap-1 text-sm"
          style={{ color: "var(--theme-text)", opacity: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <span>⭐</span> <span>Mission</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🎁</span> <span>Treasure</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🎮</span> <span>Mini-Game</span>
          </div>
          <div className="flex items-center gap-2">
            <span>👑</span> <span>Boss</span>
          </div>
        </div>
      </div>
    </div>
  );
}
