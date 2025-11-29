"use client";

import confetti from "canvas-confetti";

// Burst confetti from the center
export function celebrationBurst() {
  const count = 200;
  const defaults = {
    origin: { y: 0.6 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Fire multiple bursts with different settings
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

// Stars burst for mission complete
export function starBurst() {
  const defaults = {
    spread: 360,
    ticks: 60,
    gravity: 0,
    decay: 0.96,
    startVelocity: 20,
    shapes: ["star"] as confetti.Shape[],
    colors: ["#FFD700", "#FFA500", "#FF6347"],
    zIndex: 9999,
  };

  function shoot() {
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      origin: { x: 0.5, y: 0.5 },
    });

    confetti({
      ...defaults,
      particleCount: 20,
      scalar: 0.75,
      origin: { x: 0.5, y: 0.5 },
    });
  }

  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
}

// Simple celebration for correct answer
export function correctAnswerCelebration() {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors: ["#10B981", "#34D399", "#6EE7B7"], // Emerald colors
    zIndex: 9999,
  });
}

// Subtle sparkle effect
export function sparkle(x: number, y: number) {
  confetti({
    particleCount: 15,
    spread: 30,
    startVelocity: 15,
    origin: { x, y },
    gravity: 0.5,
    ticks: 40,
    colors: ["#818CF8", "#A5B4FC", "#C7D2FE"], // Indigo colors
    zIndex: 9999,
  });
}
