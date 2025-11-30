"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import type { Word } from "@/lib/db/schema";
import { getWordType, type WordType } from "./word-types";

export interface WordMetadata {
  id: string;
  text: string;
  type: string;
  emoji: string | null;
  imageUrl: string | null;
  isSightWord: boolean;
  isCharacterWord: boolean;
  wordType: WordType;
}

interface WordMetadataContextValue {
  /** Get metadata for a word by its text */
  getWordMetadata: (wordText: string) => WordMetadata | null;
  /** Check if metadata is loaded */
  isLoaded: boolean;
  /** Load metadata for specific words */
  loadWords: (wordTexts: string[]) => Promise<void>;
}

const WordMetadataContext = createContext<WordMetadataContextValue | null>(null);

interface WordMetadataProviderProps {
  children: ReactNode;
  /** Initial words to preload (optional) */
  initialWords?: Word[];
}

export function WordMetadataProvider({ children, initialWords }: WordMetadataProviderProps) {
  const [wordMap, setWordMap] = useState<Map<string, WordMetadata>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize with preloaded words
  useEffect(() => {
    if (initialWords && initialWords.length > 0) {
      const map = new Map<string, WordMetadata>();
      for (const word of initialWords) {
        const metadata: WordMetadata = {
          id: word.id,
          text: word.text,
          type: word.type,
          emoji: word.emoji || null,
          imageUrl: word.imageUrl || null,
          isSightWord: word.isSightWord || false,
          isCharacterWord: word.isCharacterWord || false,
          wordType: getWordType(word),
        };
        map.set(word.text.toLowerCase(), metadata);
      }
      setWordMap(map);
      setIsLoaded(true);
    }
  }, [initialWords]);

  const getWordMetadata = useCallback(
    (wordText: string): WordMetadata | null => {
      return wordMap.get(wordText.toLowerCase()) || null;
    },
    [wordMap]
  );

  const loadWords = useCallback(async (wordTexts: string[]) => {
    if (wordTexts.length === 0) return;

    // Filter out words we already have
    const needToLoad = wordTexts.filter(
      (text) => !wordMap.has(text.toLowerCase())
    );

    if (needToLoad.length === 0) return;

    try {
      const response = await fetch("/api/words/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words: needToLoad }),
      });

      if (!response.ok) {
        console.error("Failed to load word metadata");
        return;
      }

      const data = await response.json();
      const newWords = data.words as Word[];

      setWordMap((prev) => {
        const next = new Map(prev);
        for (const word of newWords) {
          const metadata: WordMetadata = {
            id: word.id,
            text: word.text,
            type: word.type,
            emoji: word.emoji || null,
            imageUrl: word.imageUrl || null,
            isSightWord: word.isSightWord || false,
            isCharacterWord: word.isCharacterWord || false,
            wordType: getWordType(word),
          };
          next.set(word.text.toLowerCase(), metadata);
        }
        return next;
      });
    } catch (error) {
      console.error("Error loading word metadata:", error);
    }
  }, [wordMap]);

  return (
    <WordMetadataContext.Provider value={{ getWordMetadata, isLoaded, loadWords }}>
      {children}
    </WordMetadataContext.Provider>
  );
}

export function useWordMetadata() {
  const context = useContext(WordMetadataContext);
  if (!context) {
    // Return a stub that returns null for all lookups when not in provider
    return {
      getWordMetadata: () => null,
      isLoaded: false,
      loadWords: async () => {},
    };
  }
  return context;
}
