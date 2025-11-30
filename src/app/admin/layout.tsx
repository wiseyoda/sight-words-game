"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ParentalGate } from "@/components/admin/ParentalGate";
import { AdminContext, type AdminSession } from "@/lib/admin/AdminContext";

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const ADMIN_SESSION_COOKIE = "admin_session";

// Helper to set session cookie
function setSessionCookie(authenticated: boolean, expiresAt: Date) {
  const value = JSON.stringify({ authenticated, expiresAt: expiresAt.toISOString() });
  document.cookie = `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(value)}; path=/; max-age=${SESSION_TIMEOUT_MS / 1000}; SameSite=Strict`;
}

// Helper to clear session cookie
function clearSessionCookie() {
  document.cookie = `${ADMIN_SESSION_COOKIE}=; path=/; max-age=0`;
}

// Helper to check existing session cookie
function checkSessionCookie(): boolean {
  if (typeof document === "undefined") return false;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === ADMIN_SESSION_COOKIE && value) {
      try {
        const data = JSON.parse(decodeURIComponent(value));
        return data.authenticated && new Date(data.expiresAt) > new Date();
      } catch {
        return false;
      }
    }
  }
  return false;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/players", label: "Players", icon: "👤" },
  { href: "/admin/progress", label: "Progress", icon: "📈" },
  { href: "/admin/content", label: "Content", icon: "📚" },
  { href: "/admin/generator", label: "AI Generator", icon: "🤖" },
  { href: "/admin/emoji", label: "Emoji Studio", icon: "✨" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<AdminSession>({
    isAuthenticated: false,
    lastActivity: Date.now(),
    selectedPlayerId: null,
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const hasValidSession = checkSessionCookie();
    if (hasValidSession) {
      setSession({
        isAuthenticated: true,
        lastActivity: Date.now(),
        selectedPlayerId: null,
      });
    }
    setIsLoading(false);
  }, []);

  // Check for session timeout
  useEffect(() => {
    const checkSession = () => {
      if (session.isAuthenticated) {
        const now = Date.now();
        if (now - session.lastActivity > SESSION_TIMEOUT_MS) {
          clearSessionCookie();
          setSession((s) => ({ ...s, isAuthenticated: false }));
        }
      }
    };

    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [session.isAuthenticated, session.lastActivity]);

  // Refresh activity on interaction (also refreshes cookie)
  const refreshActivity = () => {
    const expiresAt = new Date(Date.now() + SESSION_TIMEOUT_MS);
    setSessionCookie(true, expiresAt);
    setSession((s) => ({ ...s, lastActivity: Date.now() }));
  };

  const setSelectedPlayer = (id: string | null) => {
    setSession((s) => ({ ...s, selectedPlayerId: id, lastActivity: Date.now() }));
  };

  const logout = () => {
    clearSessionCookie();
    setSession({
      isAuthenticated: false,
      lastActivity: Date.now(),
      selectedPlayerId: null,
    });
  };

  const handleGateSuccess = () => {
    const expiresAt = new Date(Date.now() + SESSION_TIMEOUT_MS);
    setSessionCookie(true, expiresAt);
    setSession({
      isAuthenticated: true,
      lastActivity: Date.now(),
      selectedPlayerId: null,
    });
  };

  // Show loading state while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show parental gate if not authenticated
  if (!session.isAuthenticated) {
    return <ParentalGate onSuccess={handleGateSuccess} />;
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <AdminContext.Provider value={{ session, setSelectedPlayer, refreshActivity, logout }}>
      <div className="min-h-screen bg-gray-100 flex" onClick={refreshActivity}>
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-16"
          } bg-white shadow-lg transition-all duration-300 flex flex-col`}
        >
          {/* Logo/Title */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <h1 className="text-lg font-bold text-indigo-600">
                  Parent Dashboard
                </h1>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                {sidebarOpen ? "◀" : "▶"}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.href, item.exact)
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            ))}
          </nav>

          {/* Back to Game */}
          <div className="p-2 border-t border-gray-200">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <span className="text-xl">🎮</span>
              {sidebarOpen && <span className="font-medium">Back to Game</span>}
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {navItems.find((item) =>
                isActive(item.href, item.exact)
              )?.label || "Dashboard"}
            </h2>

            <div className="flex items-center gap-4">
              {/* Session indicator */}
              <div className="text-sm text-gray-500">
                Session active
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
