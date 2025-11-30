"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Theme, ThemePalette, ThemeAssets, ThemeCharacter } from "@/lib/db/schema";

// CSS variable mapping
const CSS_VARIABLES: Record<keyof ThemePalette, string> = {
  primary: "--theme-primary",
  secondary: "--theme-secondary",
  accent: "--theme-accent",
  background: "--theme-background",
  cardBackground: "--theme-card-bg",
  text: "--theme-text",
  success: "--theme-success",
  special: "--theme-special",
};

// Default palette (fallback)
const DEFAULT_PALETTE: ThemePalette = {
  primary: "#6366f1", // indigo-500
  secondary: "#8b5cf6", // violet-500
  accent: "#f59e0b", // amber-500
  background: "#f8fafc", // slate-50
  cardBackground: "#ffffff",
  text: "#1e293b", // slate-800
  success: "#22c55e", // green-500
  special: "#fbbf24", // amber-400
};

export interface ThemeContextType {
  currentTheme: Theme | null;
  isLoading: boolean;
  error: Error | null;
  switchTheme: (themeId: string) => Promise<void>;
  prefersReducedMotion: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Local storage key
const THEME_STORAGE_KEY = "sightwords:theme";

interface ThemeProviderProps {
  children: ReactNode;
  initialThemeId?: string;
}

export function ThemeProvider({ children, initialThemeId }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Apply CSS variables when theme changes
  const applyCssVariables = useCallback((palette: ThemePalette | null | undefined, assets: ThemeAssets | null | undefined) => {
    const root = document.documentElement;
    const effectivePalette = { ...DEFAULT_PALETTE, ...palette };

    // Apply color variables
    Object.entries(CSS_VARIABLES).forEach(([key, cssVar]) => {
      const value = effectivePalette[key as keyof ThemePalette];
      if (value) {
        root.style.setProperty(cssVar, value);
      }
    });

    // Apply asset URLs
    if (assets?.background) {
      root.style.setProperty("--theme-bg-image", `url(${assets.background})`);
    } else {
      root.style.removeProperty("--theme-bg-image");
    }

    if (assets?.mapBackground) {
      root.style.setProperty("--theme-map-bg", `url(${assets.mapBackground})`);
    } else {
      root.style.removeProperty("--theme-map-bg");
    }
  }, []);

  // Fetch theme from API
  const fetchTheme = useCallback(async (themeId: string): Promise<Theme> => {
    const response = await fetch(`/api/themes/${themeId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch theme: ${response.statusText}`);
    }
    return response.json();
  }, []);

  // Load initial theme
  useEffect(() => {
    const loadTheme = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Priority: initialThemeId > localStorage > default
        let themeId = initialThemeId;

        if (!themeId && typeof window !== "undefined") {
          themeId = localStorage.getItem(THEME_STORAGE_KEY) || undefined;
        }

        if (themeId) {
          const theme = await fetchTheme(themeId);
          setCurrentTheme(theme);
          applyCssVariables(theme.palette, theme.assets);

          // Save to localStorage
          localStorage.setItem(THEME_STORAGE_KEY, themeId);
        } else {
          // No theme specified - try to load first available theme
          try {
            const response = await fetch("/api/themes");
            if (response.ok) {
              const data = await response.json();
              if (data.themes && data.themes.length > 0) {
                const defaultTheme = data.themes[0];
                setCurrentTheme(defaultTheme);
                applyCssVariables(defaultTheme.palette, defaultTheme.assets);
                localStorage.setItem(THEME_STORAGE_KEY, defaultTheme.id);
                return;
              }
            }
          } catch {
            // Ignore and fall through to defaults
          }
          // No themes available, apply defaults
          applyCssVariables(DEFAULT_PALETTE, null);
        }
      } catch (err) {
        console.error("Failed to load theme:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        // Apply default palette on error
        applyCssVariables(DEFAULT_PALETTE, null);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [initialThemeId, fetchTheme, applyCssVariables]);

  // Switch to a different theme
  const switchTheme = useCallback(async (themeId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const theme = await fetchTheme(themeId);
      setCurrentTheme(theme);
      applyCssVariables(theme.palette, theme.assets);

      // Save to localStorage
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch (err) {
      console.error("Failed to switch theme:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [fetchTheme, applyCssVariables]);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        isLoading,
        error,
        switchTheme,
        prefersReducedMotion,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme context
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Hook to get current theme characters
export function useThemeCharacters(): ThemeCharacter[] {
  const { currentTheme } = useTheme();
  return currentTheme?.characters || [];
}

// Hook to check if a word is a character name
export function useIsCharacterWord(): (word: string) => ThemeCharacter | undefined {
  const characters = useThemeCharacters();

  return useCallback(
    (word: string) => {
      const normalizedWord = word.toLowerCase().trim();
      return characters.find(
        (char) => char.name.toLowerCase() === normalizedWord
      );
    },
    [characters]
  );
}
