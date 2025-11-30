"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Player, Mission, MissionProgress, WordMastery, Word } from "@/lib/db/schema";

interface ProgressPageProps {
  players: Player[];
  selectedPlayer: Player | null;
  progress: MissionProgress[];
  wordMasteryData: WordMastery[];
  missions?: Mission[];
  words?: Word[];
}

type MasteryLevel = "mastered" | "familiar" | "learning" | "new";

const MASTERY_COLORS: Record<MasteryLevel, { bg: string; text: string; label: string }> = {
  mastered: { bg: "bg-green-500", text: "text-green-600", label: "Mastered" },
  familiar: { bg: "bg-blue-500", text: "text-blue-600", label: "Familiar" },
  learning: { bg: "bg-yellow-500", text: "text-yellow-600", label: "Learning" },
  new: { bg: "bg-gray-300", text: "text-gray-600", label: "New" },
};

// Calculate mastery level based on performance
function calculateMasteryLevel(mastery: WordMastery): MasteryLevel {
  const timesSeen = mastery.timesSeen ?? 0;
  const timesCorrectFirstTry = mastery.timesCorrectFirstTry ?? 0;
  const streakCurrent = mastery.streakCurrent ?? 0;

  if (timesSeen === 0) return "new";

  const accuracy = timesSeen > 0 ? (timesCorrectFirstTry / timesSeen) * 100 : 0;

  if (accuracy >= 90 && streakCurrent >= 3 && timesSeen >= 5) return "mastered";
  if (accuracy >= 70 && timesSeen >= 3) return "familiar";
  if (timesSeen >= 1) return "learning";

  return "new";
}

// Get struggling words (accuracy < 60% or missed 3+ times)
function getStrugglingWords(
  wordMasteryData: WordMastery[],
  words: Word[]
): { word: Word; mastery: WordMastery; accuracy: number }[] {
  const wordMap = new Map(words.map((w) => [w.id, w]));

  return wordMasteryData
    .filter((m) => {
      const timesSeen = m.timesSeen ?? 0;
      if (timesSeen < 2) return false;
      const accuracy = timesSeen > 0
        ? ((m.timesCorrectFirstTry ?? 0) / timesSeen) * 100
        : 0;
      return accuracy < 60 || (m.timesNeededHint ?? 0) >= 3;
    })
    .map((m) => {
      const timesSeen = m.timesSeen ?? 0;
      return {
        word: wordMap.get(m.wordId)!,
        mastery: m,
        accuracy: timesSeen > 0
          ? Math.round(((m.timesCorrectFirstTry ?? 0) / timesSeen) * 100)
          : 0,
      };
    })
    .filter((item) => item.word)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);
}

export function ProgressPage({
  players,
  selectedPlayer,
  progress,
  wordMasteryData,
  missions = [],
  words = [],
}: ProgressPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"overview" | "words" | "missions">("overview");

  // Calculate mastery stats
  const masteryStats = useMemo(() => {
    const stats: Record<MasteryLevel, number> = {
      mastered: 0,
      familiar: 0,
      learning: 0,
      new: 0,
    };

    wordMasteryData.forEach((m) => {
      const level = calculateMasteryLevel(m);
      stats[level]++;
    });

    // Add unseen words as "new"
    const seenWordIds = new Set(wordMasteryData.map((m) => m.wordId));
    const unseenCount = words.filter((w) => !seenWordIds.has(w.id)).length;
    stats.new += unseenCount;

    return stats;
  }, [wordMasteryData, words]);

  const totalWords = Object.values(masteryStats).reduce((a, b) => a + b, 0);
  const masteredPercent = totalWords > 0 ? Math.round((masteryStats.mastered / totalWords) * 100) : 0;

  // Calculate time stats
  // Note: Daily/weekly are estimates based on mission completions (~3 min each)
  // Total uses actual tracked playtime from player record
  const timeStats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Count missions completed today and this week
    let todayMissions = 0;
    let weekMissions = 0;

    progress.forEach((p) => {
      const completedAt = new Date(p.completedAt);
      if (completedAt >= today) {
        todayMissions++;
      }
      if (completedAt >= weekAgo) {
        weekMissions++;
      }
    });

    // Use actual total play time, distribute proportionally for estimates
    const totalMinutes = Math.round((selectedPlayer?.totalPlayTimeSeconds || 0) / 60);
    const totalMissions = progress.length;

    // Average time per mission based on actual play time
    const avgMinutesPerMission = totalMissions > 0 ? totalMinutes / totalMissions : 3;

    return {
      today: Math.round(todayMissions * avgMinutesPerMission),
      week: Math.round(weekMissions * avgMinutesPerMission),
      total: totalMinutes,
      isEstimated: true, // Flag that daily/weekly are estimates
    };
  }, [progress, selectedPlayer]);

  // Get struggling words
  const strugglingWords = useMemo(
    () => getStrugglingWords(wordMasteryData, words),
    [wordMasteryData, words]
  );

  // Mission stats
  const missionStats = useMemo(() => {
    const totalStars = progress.reduce((sum, p) => sum + (p.stars || 0), 0);
    const perfectMissions = progress.filter((p) => p.stars === 3).length;
    return { total: progress.length, stars: totalStars, perfect: perfectMissions };
  }, [progress]);

  const handlePlayerChange = (playerId: string) => {
    router.push(`/admin/progress?player=${playerId}`);
  };

  if (!selectedPlayer && players.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Players Yet</h3>
        <p className="text-gray-500">Create a player to start tracking progress</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Player Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress Reports</h1>
          <p className="text-gray-500 mt-1">Track learning progress and identify areas for improvement</p>
        </div>
        <select
          value={selectedPlayer?.id || ""}
          onChange={(e) => handlePlayerChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
        >
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.avatarId} {player.name}
            </option>
          ))}
        </select>
      </div>

      {selectedPlayer ? (
        <>
          {/* Report Card Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                {selectedPlayer.avatarId || "👤"}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{selectedPlayer.name}&apos;s Report Card</h2>
                <p className="text-indigo-100">
                  Learning since {new Date(selectedPlayer.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold">{masteryStats.mastered}</div>
                <div className="text-sm text-indigo-100">Words Mastered</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold">{missionStats.total}</div>
                <div className="text-sm text-indigo-100">Missions Completed</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold">{selectedPlayer.totalStars || 0}</div>
                <div className="text-sm text-indigo-100">Stars Earned</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex gap-2 p-2">
                {(["overview", "words", "missions"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 font-medium rounded-lg transition ${
                      activeTab === tab
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Word Mastery Overview */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Word Mastery</h3>
                    <div className="bg-gray-100 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Overall Progress</span>
                        <span className="font-semibold text-gray-900">
                          {masteryStats.mastered} / {totalWords} ({masteredPercent}%)
                        </span>
                      </div>
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
                        {(Object.keys(MASTERY_COLORS) as MasteryLevel[]).map((level) => {
                          const percent = totalWords > 0 ? (masteryStats[level] / totalWords) * 100 : 0;
                          return (
                            <div
                              key={level}
                              className={`h-full ${MASTERY_COLORS[level].bg}`}
                              style={{ width: `${percent}%` }}
                            />
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap gap-4 mt-4">
                        {(Object.keys(MASTERY_COLORS) as MasteryLevel[]).map((level) => (
                          <div key={level} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${MASTERY_COLORS[level].bg}`} />
                            <span className="text-sm text-gray-600">
                              {MASTERY_COLORS[level].label}: {masteryStats[level]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Time Stats */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Played</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">~{timeStats.today}</div>
                        <div className="text-sm text-gray-500">Minutes Today*</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">~{timeStats.week}</div>
                        <div className="text-sm text-gray-500">Minutes This Week*</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-indigo-600">{timeStats.total}</div>
                        <div className="text-sm text-gray-500">Minutes Total</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">* Estimated based on mission completions</p>
                  </div>

                  {/* Struggling Words Alert */}
                  {strugglingWords.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
                        <span>⚠️</span> Needs Attention
                      </h3>
                      <p className="text-amber-700 mb-4">
                        {selectedPlayer.name} is having trouble with these words:
                      </p>
                      <div className="space-y-3">
                        {strugglingWords.map(({ word, mastery, accuracy }) => (
                          <div
                            key={word.id}
                            className="bg-white rounded-lg p-3 flex items-center justify-between"
                          >
                            <div>
                              <span className="font-semibold text-gray-900">&ldquo;{word.text}&rdquo;</span>
                              <p className="text-sm text-gray-500">
                                Seen {mastery.timesSeen}x | Accuracy: {accuracy}%
                                {(mastery.timesNeededHint || 0) >= 3 && " | Needs hints often"}
                              </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm ${
                              accuracy < 40 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                            }`}>
                              {accuracy}%
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-amber-200">
                        <p className="text-sm text-amber-700 mb-3">
                          <strong>Suggestions:</strong>
                        </p>
                        <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                          <li>Practice these words outside the game</li>
                          <li>Point out differences between similar words</li>
                          <li>Use AI Generator to create practice sentences</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "words" && (
                <div className="space-y-6">
                  {/* Filter and Search */}
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Search words..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white">
                      <option value="all">All Levels</option>
                      <option value="mastered">Mastered</option>
                      <option value="familiar">Familiar</option>
                      <option value="learning">Learning</option>
                      <option value="new">New</option>
                    </select>
                  </div>

                  {/* Word List by Mastery Level */}
                  {(Object.keys(MASTERY_COLORS) as MasteryLevel[]).map((level) => {
                    const levelWords = wordMasteryData.filter(
                      (m) => calculateMasteryLevel(m) === level
                    );
                    if (levelWords.length === 0 && level !== "new") return null;

                    const wordMap = new Map(words.map((w) => [w.id, w]));
                    const displayWords = level === "new"
                      ? words.filter((w) => !wordMasteryData.find((m) => m.wordId === w.id))
                      : levelWords.map((m) => wordMap.get(m.wordId)).filter(Boolean);

                    if (displayWords.length === 0) return null;

                    return (
                      <div key={level}>
                        <h4 className={`font-semibold mb-3 flex items-center gap-2 ${MASTERY_COLORS[level].text}`}>
                          <div className={`w-3 h-3 rounded-full ${MASTERY_COLORS[level].bg}`} />
                          {MASTERY_COLORS[level].label} ({displayWords.length} words)
                        </h4>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex flex-wrap gap-2">
                            {displayWords.slice(0, 30).map((word) => (
                              <span
                                key={word!.id}
                                className="px-3 py-1 bg-white rounded-lg text-sm text-gray-700 border border-gray-200"
                              >
                                {word!.text}
                              </span>
                            ))}
                            {displayWords.length > 30 && (
                              <span className="px-3 py-1 text-sm text-gray-500">
                                +{displayWords.length - 30} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === "missions" && (
                <div className="space-y-6">
                  {/* Mission Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-indigo-600">{missionStats.total}</div>
                      <div className="text-sm text-gray-500">Completed</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-500">{missionStats.stars}</div>
                      <div className="text-sm text-gray-500">Total Stars</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{missionStats.perfect}</div>
                      <div className="text-sm text-gray-500">Perfect (3 Stars)</div>
                    </div>
                  </div>

                  {/* Mission History */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Recent Activity</h4>
                    {progress.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No missions completed yet</p>
                    ) : (
                      <div className="space-y-2">
                        {progress.slice(0, 20).map((p) => {
                          const mission = missions.find((m) => m.id === p.missionId);
                          return (
                            <div
                              key={p.id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  {mission?.title || "Unknown Mission"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(p.completedAt).toLocaleDateString()}{" "}
                                  {new Date(p.completedAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <div className="flex gap-0.5">
                                {[0, 1, 2].map((i) => (
                                  <span
                                    key={i}
                                    className={`text-xl ${
                                      i < (p.stars || 0) ? "text-yellow-400" : "text-gray-300"
                                    }`}
                                  >
                                    ⭐
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end">
            <button className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
              <span>📥</span>
              Export Progress
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-gray-500">Select a player to view their progress</p>
        </div>
      )}
    </div>
  );
}
