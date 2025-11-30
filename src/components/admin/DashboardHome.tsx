"use client";

import Link from "next/link";
import type { Player, Theme, MissionProgress } from "@/lib/db/schema";

interface DashboardStats {
  totalPlayers: number;
  totalWords: number;
  totalMissions: number;
  totalThemes: number;
  totalCampaigns: number;
  totalCompletedMissions: number;
  totalWordMasteryRecords: number;
}

interface DashboardHomeProps {
  players: Player[];
  stats: DashboardStats;
  recentProgress: MissionProgress[];
  themes: Theme[];
}

function StatCard({
  label,
  value,
  icon,
  color = "indigo",
}: {
  label: string;
  value: number | string;
  icon: string;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    indigo: "bg-indigo-100 text-indigo-600",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    amber: "bg-amber-100 text-amber-600",
    rose: "bg-rose-100 text-rose-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon,
  color = "indigo",
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    indigo: "bg-indigo-600 hover:bg-indigo-700",
    green: "bg-green-600 hover:bg-green-700",
    purple: "bg-purple-600 hover:bg-purple-700",
    blue: "bg-blue-600 hover:bg-blue-700",
  };

  return (
    <Link
      href={href}
      className={`block rounded-xl p-6 text-white transition ${colorClasses[color]}`}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-sm opacity-90 mt-1">{description}</p>
    </Link>
  );
}

export function DashboardHome({
  players,
  stats,
  recentProgress,
  themes,
}: DashboardHomeProps) {
  const activePlayer = players[0]; // Most recently active player

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome to Parent Dashboard
        </h1>
        <p className="text-indigo-100">
          {activePlayer
            ? `${activePlayer.name} was last active. View their progress or manage content.`
            : "Create a player profile to start tracking progress!"}
        </p>
        {!activePlayer && (
          <Link
            href="/admin/players"
            className="inline-flex items-center gap-2 mt-4 px-6 py-2 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition"
          >
            <span>👤</span>
            Create First Player
          </Link>
        )}
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Players"
            value={stats.totalPlayers}
            icon="👤"
            color="indigo"
          />
          <StatCard
            label="Words in Bank"
            value={stats.totalWords}
            icon="📝"
            color="blue"
          />
          <StatCard
            label="Missions Completed"
            value={stats.totalCompletedMissions}
            icon="⭐"
            color="amber"
          />
          <StatCard
            label="Active Themes"
            value={stats.totalThemes}
            icon="🎨"
            color="purple"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            title="AI Generator"
            description="Create new sentences and campaigns with AI"
            href="/admin/generator"
            icon="🤖"
            color="purple"
          />
          <QuickActionCard
            title="View Progress"
            description="See word mastery and mission history"
            href="/admin/progress"
            icon="📈"
            color="green"
          />
          <QuickActionCard
            title="Manage Content"
            description="Add words, sentences, and themes"
            href="/admin/content"
            icon="📚"
            color="blue"
          />
        </div>
      </div>

      {/* Players Overview */}
      {players.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Players</h2>
            <Link
              href="/admin/players"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Manage all →
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {players.slice(0, 5).map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl">
                      {player.avatarId || "👤"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{player.name}</p>
                      <p className="text-sm text-gray-500">
                        {player.totalStars || 0} ⭐ earned
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/progress?player=${player.id}`}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    View Progress
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Themes */}
      {themes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Active Themes
            </h2>
            <Link
              href="/admin/content"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.slice(0, 3).map((theme) => (
              <div
                key={theme.id}
                className="bg-white rounded-xl shadow-sm p-4 border-l-4"
                style={{
                  borderLeftColor: theme.palette?.primary || "#6366f1",
                }}
              >
                <h3 className="font-semibold text-gray-900">
                  {theme.displayName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {theme.characters?.length || 0} characters
                </p>
                {theme.palette && (
                  <div className="flex gap-1 mt-3">
                    {Object.entries(theme.palette)
                      .slice(0, 5)
                      .map(([key, color]) => (
                        <div
                          key={key}
                          className="w-6 h-6 rounded-full border border-gray-200"
                          style={{ backgroundColor: color }}
                          title={key}
                        />
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentProgress.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Activity
          </h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {recentProgress.slice(0, 5).map((progress) => (
                <div
                  key={progress.id}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <p className="text-sm text-gray-900">
                      Mission completed
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(progress.completedAt).toLocaleDateString()}{" "}
                      {new Date(progress.completedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={
                          i < (progress.stars || 0)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
