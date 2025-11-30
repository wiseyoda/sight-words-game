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

    const normalizeWord = (text: string) => text.toLowerCase().trim();
    const isFetchableWord = (text: string) => /^[a-z][a-z'\\-]*$/.test(text);

    // Normalize, dedupe, and skip anything we've already cached
    const normalizedWords = Array.from(
      new Set(
        wordTexts
          .map((text) => (typeof text === "string" ? normalizeWord(text) : ""))
          .filter(Boolean)
      )
    );
    const unseenWords = normalizedWords.filter((text) => !wordMap.has(text));

    // Nothing new to load
    if (unseenWords.length === 0) return;

    // Split into fetchable words and tokens we should skip (punctuation, etc.)
    const fetchableWords = unseenWords.filter(isFetchableWord);
    const skippedTokens = unseenWords.filter((text) => !isFetchableWord(text));

    // If the only unseen items are punctuation, just cache placeholders and stop
    if (fetchableWords.length === 0 && skippedTokens.length > 0) {
      setWordMap((prev) => {
        const next = new Map(prev);
        for (const text of skippedTokens) {
          if (!next.has(text)) {
            next.set(text, {
              id: `placeholder-${text}`,
              text,
              type: "placeholder",
              emoji: null,
              imageUrl: null,
              isSightWord: false,
              isCharacterWord: false,
              wordType: "other",
            });
          }
        }
        return next;
      });
      return;
    }

    let fetchedWords: Word[] = [];
    try {
      const response = await fetch("/api/words/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words: fetchableWords }),
      });

      if (!response.ok) {
        console.error("Failed to load word metadata");
        return;
      }

      const data = await response.json();
      fetchedWords = (data.words as Word[]) || [];
    } catch (error) {
      console.error("Error loading word metadata:", error);
      return;
    }

    // Track any words that came back empty so we do not re-request them forever
    const fetchedSet = new Set(
      fetchedWords.map((word) => normalizeWord(word.text))
    );
    const missingWords = fetchableWords.filter((text) => !fetchedSet.has(text));

    if (missingWords.length > 0) {
      console.warn("Missing word metadata for:", missingWords);
    }

    setWordMap((prev) => {
      const next = new Map(prev);
      for (const word of fetchedWords) {
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
        next.set(normalizeWord(word.text), metadata);
      }

      const addPlaceholder = (text: string) => {
        if (next.has(text)) return;
        next.set(text, {
          id: `placeholder-${text}`,
          text,
          type: "placeholder",
          emoji: null,
          imageUrl: null,
          isSightWord: false,
          isCharacterWord: false,
          wordType: "other",
        });
      };

      skippedTokens.forEach(addPlaceholder);
      missingWords.forEach(addPlaceholder);

      // If nothing new was added, avoid pointless state update
      if (next.size === prev.size) {
        return prev;
      }
      return next;
    });
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
