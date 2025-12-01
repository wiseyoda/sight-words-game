"use client";

import { ThemeProvider } from "@/lib/theme";
import { AudioProvider } from "@/lib/audio";
import { PlayerProvider } from "@/lib/player";
import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
  initialThemeId?: string;
}

export function Providers({ children, initialThemeId }: ProvidersProps) {
  return (
    <PlayerProvider>
      <ThemeProvider initialThemeId={initialThemeId}>
        <AudioProvider>
          {children}
        </AudioProvider>
      </ThemeProvider>
    </PlayerProvider>
  );
}
