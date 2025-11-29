import { create } from "zustand";

interface PlacedWord {
  word: string;
  slotIndex: number;
}

interface SentenceState {
  // Words available in the word bank
  availableWords: string[];
  // Words placed in slots (index = slot position)
  slots: (string | null)[];
  // Number of slots in the sentence
  slotCount: number;
  // Currently selected word (for tap-to-place)
  selectedWord: string | null;
  // Validation state
  isValidating: boolean;
  validationResult: "correct" | "incorrect" | null;

  // Actions
  initializeSentence: (words: string[], distractors: string[], slotCount: number) => void;
  placeWord: (word: string, slotIndex?: number) => void;
  removeWord: (slotIndex: number) => void;
  selectWord: (word: string | null) => void;
  clearSlots: () => void;
  setValidating: (isValidating: boolean) => void;
  setValidationResult: (result: "correct" | "incorrect" | null) => void;
  getSubmittedSentence: () => string[];
  reset: () => void;
}

export const useSentenceStore = create<SentenceState>((set, get) => ({
  availableWords: [],
  slots: [],
  slotCount: 0,
  selectedWord: null,
  isValidating: false,
  validationResult: null,

  initializeSentence: (words, distractors, slotCount) => {
    // Combine words and distractors, shuffle
    const allWords = [...words, ...distractors];
    const shuffled = allWords.sort(() => Math.random() - 0.5);

    set({
      availableWords: shuffled,
      slots: Array(slotCount).fill(null),
      slotCount,
      selectedWord: null,
      isValidating: false,
      validationResult: null,
    });
  },

  placeWord: (word, slotIndex) => {
    const { slots, availableWords } = get();

    // Find the target slot (first empty if not specified)
    const targetIndex = slotIndex ?? slots.findIndex((s) => s === null);

    // If all slots are filled, do nothing
    if (targetIndex === -1) return;

    // If word is already placed, do nothing
    if (slots.includes(word)) return;

    // Place the word
    const newSlots = [...slots];
    newSlots[targetIndex] = word;

    // Remove from available words
    const newAvailable = availableWords.filter((w) => w !== word);

    set({
      slots: newSlots,
      availableWords: newAvailable,
      selectedWord: null,
    });
  },

  removeWord: (slotIndex) => {
    const { slots, availableWords } = get();
    const word = slots[slotIndex];

    if (!word) return;

    // Remove from slot
    const newSlots = [...slots];
    newSlots[slotIndex] = null;

    // Add back to available words
    const newAvailable = [...availableWords, word];

    set({
      slots: newSlots,
      availableWords: newAvailable,
    });
  },

  selectWord: (word) => {
    set({ selectedWord: word });
  },

  clearSlots: () => {
    const { slots, availableWords } = get();

    // Move all placed words back to available
    const placedWords = slots.filter((w): w is string => w !== null);
    const newAvailable = [...availableWords, ...placedWords];

    set({
      slots: slots.map(() => null),
      availableWords: newAvailable,
      selectedWord: null,
      validationResult: null,
    });
  },

  setValidating: (isValidating) => {
    set({ isValidating });
  },

  setValidationResult: (result) => {
    set({ validationResult: result, isValidating: false });
  },

  getSubmittedSentence: () => {
    const { slots } = get();
    return slots.filter((w): w is string => w !== null);
  },

  reset: () => {
    set({
      availableWords: [],
      slots: [],
      slotCount: 0,
      selectedWord: null,
      isValidating: false,
      validationResult: null,
    });
  },
}));
