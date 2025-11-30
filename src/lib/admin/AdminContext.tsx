"use client";

import { createContext, useContext } from "react";

// Admin session context
export interface AdminSession {
  isAuthenticated: boolean;
  lastActivity: number;
  selectedPlayerId: string | null;
}

export interface AdminContextValue {
  session: AdminSession;
  setSelectedPlayer: (id: string | null) => void;
  refreshActivity: () => void;
  logout: () => void;
}

export const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdminContext() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdminContext must be used within AdminLayout");
  return ctx;
}
