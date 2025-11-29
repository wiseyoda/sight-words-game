import { create } from "zustand";

export interface WordCardData {
  id: string;
  text: string;
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createWordEntries(words: string[]): WordCardData[] {
  const salt = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return words.map((text, index) => ({
    id: `word-${salt}-${index}`,
    text,
  }));
}

interface SentenceState {
  // Words available in the word bank
  availableWords: WordCardData[];
  // Words placed in slots (index = slot position)
  slots: (WordCardData | null)[];
  // Number of slots in the sentence
  slotCount: number;
  // Currently selected word (for tap-to-place)
  selectedWord: string | null;
  // Validation state
  isValidating: boolean;
  validationResult: "correct" | "incorrect" | null;

  // Actions
  initializeSentence: (words: string[], distractors: string[], slotCount: number) => void;
  placeWord: (wordId: string, slotIndex?: number) => void;
  removeWord: (slotIndex: number) => void;
  moveWordToSlot: (fromSlotIndex: number, toSlotIndex: number) => void;
  returnWordToBank: (slotIndex: number) => void;
  reorderWordBank: (activeId: string, overId: string) => void;
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
    const allWords = createWordEntries([...words, ...distractors]);
    const shuffled = shuffleArray(allWords);

    set({
      availableWords: shuffled,
      slots: Array(slotCount).fill(null),
      slotCount,
      selectedWord: null,
      isValidating: false,
      validationResult: null,
    });
  },

  placeWord: (wordId, slotIndex) => {
    const { slots, availableWords } = get();

    // Find the target slot (first empty if not specified)
    const targetIndex = slotIndex ?? slots.findIndex((s) => s === null);

    // If all slots are filled, do nothing
    if (targetIndex === -1) return;

    const wordIndex = availableWords.findIndex((w) => w.id === wordId);
    if (wordIndex === -1) return;

    const wordToPlace = availableWords[wordIndex];

    // Place the word
    const newSlots = [...slots];
    newSlots[targetIndex] = wordToPlace;

    // Remove from available words
    const newAvailable = [...availableWords];
    newAvailable.splice(wordIndex, 1);

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

  moveWordToSlot: (fromSlotIndex, toSlotIndex) => {
    const { slots } = get();
    const fromWord = slots[fromSlotIndex];
    const toWord = slots[toSlotIndex];

    if (!fromWord) return;

    // Swap the words (toWord can be null)
    const newSlots = [...slots];
    newSlots[toSlotIndex] = fromWord;
    newSlots[fromSlotIndex] = toWord;

    set({ slots: newSlots });
  },

  returnWordToBank: (slotIndex) => {
    const { slots, availableWords } = get();
    const word = slots[slotIndex];

    if (!word) return;

    // Remove from slot
    const newSlots = [...slots];
    newSlots[slotIndex] = null;

    // Add back to beginning of available words (more intuitive)
    const newAvailable = [word, ...availableWords];

    set({
      slots: newSlots,
      availableWords: newAvailable,
    });
  },

  reorderWordBank: (activeId, overId) => {
    const { availableWords } = get();

    const oldIndex = availableWords.findIndex((w) => w.id === activeId);
    const newIndex = availableWords.findIndex((w) => w.id === overId);

    if (oldIndex === -1 || newIndex === -1) return;
    if (oldIndex === newIndex) return;

    // Reorder the array
    const newWords = [...availableWords];
    const [wordToMove] = newWords.splice(oldIndex, 1);
    if (!wordToMove) return;
    newWords.splice(newIndex, 0, wordToMove);

    set({ availableWords: newWords });
  },

  selectWord: (word) => {
    set({ selectedWord: word });
  },

  clearSlots: () => {
    const { slots, availableWords } = get();

    // Move all placed words back to available
    const placedWords = slots.filter((w): w is WordCardData => w !== null);
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
    return slots
      .filter((w): w is WordCardData => w !== null)
      .map((w) => w.text);
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
