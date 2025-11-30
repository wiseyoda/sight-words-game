"use client";

import { useState, useEffect } from "react";
import type { Theme, Campaign, Mission, Sentence } from "@/lib/db/schema";

interface ThemeWithDetails extends Theme {
  campaigns?: CampaignWithMissions[];
}

interface CampaignWithMissions extends Campaign {
  missions?: MissionWithSentences[];
}

interface MissionWithSentences extends Mission {
  sentences?: Sentence[];
}

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-6 rounded border border-gray-300"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-xs text-gray-400 font-mono">{color}</span>
    </div>
  );
}

export function ThemeViewer() {
  const [themes, setThemes] = useState<ThemeWithDetails[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<ThemeWithDetails | null>(null);
  const [expandedMissions, setExpandedMissions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load themes
  useEffect(() => {
    async function loadThemes() {
      try {
        const response = await fetch("/api/admin/themes");
        if (!response.ok) throw new Error("Failed to load themes");
        const data = await response.json();
        setThemes(data.themes || []);
        if (data.themes?.length > 0) {
          setSelectedTheme(data.themes[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }
    loadThemes();
  }, []);

  const toggleMissionExpand = (missionId: string) => {
    setExpandedMissions((prev) => {
      const next = new Set(prev);
      if (next.has(missionId)) {
        next.delete(missionId);
      } else {
        next.add(missionId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin text-2xl">🐾</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error: {error}
      </div>
    );
  }

  if (themes.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
        No themes found. Run <code className="bg-yellow-100 px-1">npm run db:seed-paw-patrol</code> to seed theme data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Theme Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Theme</h2>
        <div className="flex flex-wrap gap-2">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedTheme?.id === theme.id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {theme.displayName}
            </button>
          ))}
        </div>
      </div>

      {selectedTheme && (
        <>
          {/* Theme Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {selectedTheme.displayName}
            </h2>

            {/* Color Palette */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Color Palette</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedTheme.palette && (
                  <>
                    <ColorSwatch color={selectedTheme.palette.primary} label="Primary" />
                    <ColorSwatch color={selectedTheme.palette.secondary} label="Secondary" />
                    <ColorSwatch color={selectedTheme.palette.accent} label="Accent" />
                    <ColorSwatch color={selectedTheme.palette.background} label="Background" />
                    <ColorSwatch color={selectedTheme.palette.cardBackground} label="Card BG" />
                    <ColorSwatch color={selectedTheme.palette.text} label="Text" />
                    <ColorSwatch color={selectedTheme.palette.success} label="Success" />
                    {selectedTheme.palette.special && (
                      <ColorSwatch color={selectedTheme.palette.special} label="Special" />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Characters */}
            {selectedTheme.characters && selectedTheme.characters.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Characters ({selectedTheme.characters.length})
                </h3>
                <div className="flex flex-wrap gap-3">
                  {selectedTheme.characters.map((char) => (
                    <div
                      key={char.id}
                      className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800"
                    >
                      {char.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Phrases */}
            {selectedTheme.feedbackPhrases && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Feedback Phrases</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-green-700 mb-2">Correct</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      {selectedTheme.feedbackPhrases.correct?.map((phrase, i) => (
                        <div key={i} className="bg-green-50 px-2 py-1 rounded">{phrase}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-amber-700 mb-2">Encourage</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      {selectedTheme.feedbackPhrases.encourage?.map((phrase, i) => (
                        <div key={i} className="bg-amber-50 px-2 py-1 rounded">{phrase}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-blue-700 mb-2">Celebrate</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      {selectedTheme.feedbackPhrases.celebrate?.map((phrase, i) => (
                        <div key={i} className="bg-blue-50 px-2 py-1 rounded">{phrase}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Campaigns */}
          {selectedTheme.campaigns && selectedTheme.campaigns.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Campaigns</h2>

              {selectedTheme.campaigns.map((campaign) => (
                <div key={campaign.id} className="border border-gray-200 rounded-lg mb-4">
                  <div className="p-4 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">{campaign.title}</h3>
                    {campaign.synopsis && (
                      <p className="text-sm text-gray-600 mt-1">{campaign.synopsis}</p>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      {campaign.missions?.length || 0} missions
                    </div>
                  </div>

                  {/* Missions */}
                  {campaign.missions && campaign.missions.length > 0 && (
                    <div className="divide-y divide-gray-100">
                      {campaign.missions.map((mission) => (
                        <div key={mission.id}>
                          <button
                            onClick={() => toggleMissionExpand(mission.id)}
                            className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">
                                {mission.type === "boss" ? "👑" : mission.type === "treasure" ? "🎁" : "⭐"}
                              </span>
                              <div>
                                <span className="font-medium text-gray-800">
                                  {mission.order}. {mission.title}
                                </span>
                                <span className="ml-2 text-xs text-gray-500">
                                  Level {mission.scaffoldingLevel}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {mission.sentences?.length || 0} sentences
                              </span>
                              <span className="text-gray-400">
                                {expandedMissions.has(mission.id) ? "▼" : "▶"}
                              </span>
                            </div>
                          </button>

                          {/* Expanded mission details */}
                          {expandedMissions.has(mission.id) && (
                            <div className="p-4 bg-gray-50 border-t border-gray-100">
                              {mission.narrativeIntro && (
                                <div className="mb-3">
                                  <span className="text-xs font-medium text-gray-500">Intro:</span>
                                  <p className="text-sm text-gray-700 italic">&ldquo;{mission.narrativeIntro}&rdquo;</p>
                                </div>
                              )}

                              {mission.sentences && mission.sentences.length > 0 && (
                                <div>
                                  <span className="text-xs font-medium text-gray-500 block mb-2">Sentences:</span>
                                  <div className="space-y-2">
                                    {mission.sentences.map((sentence, i) => (
                                      <div
                                        key={sentence.id}
                                        className="text-sm bg-white p-2 rounded border border-gray-200"
                                      >
                                        <span className="text-gray-400 mr-2">{i + 1}.</span>
                                        <span className="text-gray-800">{sentence.text}</span>
                                        {sentence.distractors && (sentence.distractors as string[]).length > 0 && (
                                          <span className="ml-2 text-xs text-orange-600">
                                            +{(sentence.distractors as string[]).length} distractors
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {mission.narrativeOutro && (
                                <div className="mt-3">
                                  <span className="text-xs font-medium text-gray-500">Outro:</span>
                                  <p className="text-sm text-gray-700 italic">&ldquo;{mission.narrativeOutro}&rdquo;</p>
                                </div>
                              )}

                              {mission.unlockReward && (
                                <div className="mt-3 flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-500">Reward:</span>
                                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                    {mission.unlockReward.type}: {mission.unlockReward.name || mission.unlockReward.id}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
