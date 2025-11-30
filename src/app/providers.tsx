"use client";

import { ThemeProvider } from "@/lib/theme";
import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
  initialThemeId?: string;
}

export function Providers({ children, initialThemeId }: ProvidersProps) {
  return (
    <ThemeProvider initialThemeId={initialThemeId}>
      {children}
    </ThemeProvider>
  );
}
