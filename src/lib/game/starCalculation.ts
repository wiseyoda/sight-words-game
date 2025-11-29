/**
 * Star Calculation Logic
 *
 * Stars are earned based on hints used during a mission:
 * - 0 hints: 3 stars
 * - 1 hint: 2 stars
 * - 2+ hints: 1 star
 *
 * IMPORTANT: Stars are NEVER zero. Every completion earns at least 1 star.
 */

export function calculateStars(hintsUsed: number): 1 | 2 | 3 {
  if (hintsUsed === 0) return 3;
  if (hintsUsed === 1) return 2;
  return 1;
}

/**
 * Get the maximum possible stars based on current hints used
 */
export function getMaxPossibleStars(hintsUsed: number): 1 | 2 | 3 {
  return calculateStars(hintsUsed);
}

/**
 * Get encouraging message based on stars earned
 */
export function getStarMessage(stars: 1 | 2 | 3): string {
  switch (stars) {
    case 3:
      return "Perfect! You're a superstar!";
    case 2:
      return "Great job! You did it!";
    case 1:
      return "Good work! Keep practicing!";
  }
}

/**
 * Get star display for UI (filled vs empty)
 */
export function getStarDisplay(earned: number, total: number = 3): { filled: number; empty: number } {
  return {
    filled: Math.min(earned, total),
    empty: Math.max(0, total - earned),
  };
}
