"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

interface ParentalGateProps {
  onSuccess: () => void;
}

// Generate a random math problem that a child couldn't easily solve
function generateMathProblem(): { question: string; answer: number } {
  const operations = [
    // Addition (two-digit results)
    () => {
      const a = Math.floor(Math.random() * 10) + 5;
      const b = Math.floor(Math.random() * 10) + 5;
      return { question: `${a} + ${b}`, answer: a + b };
    },
    // Subtraction
    () => {
      const a = Math.floor(Math.random() * 15) + 10;
      const b = Math.floor(Math.random() * 8) + 2;
      return { question: `${a} - ${b}`, answer: a - b };
    },
    // Multiplication
    () => {
      const a = Math.floor(Math.random() * 5) + 3;
      const b = Math.floor(Math.random() * 5) + 2;
      return { question: `${a} × ${b}`, answer: a * b };
    },
  ];

  return operations[Math.floor(Math.random() * operations.length)]();
}

export function ParentalGate({ onSuccess }: ParentalGateProps) {
  const [problem, setProblem] = useState(() => generateMathProblem());
  const [userAnswer, setUserAnswer] = useState("");
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const parsed = parseInt(userAnswer, 10);
      if (parsed === problem.answer) {
        onSuccess();
      } else {
        setError(true);
        setAttempts((a) => a + 1);
        setUserAnswer("");

        // Generate new problem after 3 failed attempts
        if (attempts >= 2) {
          setProblem(generateMathProblem());
          setAttempts(0);
        }

        // Clear error after animation
        setTimeout(() => setError(false), 500);
      }
    },
    [userAnswer, problem.answer, attempts, onSuccess]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
      >
        {/* Lock Icon */}
        <div className="text-center mb-6">
          <motion.div
            animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="text-6xl mb-4"
          >
            🔒
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-800">Parent Zone</h1>
          <p className="text-gray-500 mt-2">
            This area is for grown-ups! Please solve the math problem to continue.
          </p>
        </div>

        {/* Math Problem */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">What is:</p>
            <div className="text-4xl font-bold text-indigo-600 mb-4">
              {problem.question} = ?
            </div>
          </div>

          <div className="relative">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Enter answer"
              className={`w-full text-center text-2xl font-bold py-4 px-6 border-2 rounded-xl focus:outline-none transition-colors ${
                error
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 focus:border-indigo-500"
              }`}
              autoFocus
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-6 left-0 right-0 text-center text-red-500 text-sm"
              >
                Try again! {3 - attempts} attempts left before new problem.
              </motion.p>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 py-3 px-6 border-2 border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!userAnswer}
              className="flex-1 py-3 px-6 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Enter
            </button>
          </div>
        </form>

        {/* Hint */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Can&apos;t solve it? Ask a parent or guardian for help!
        </p>
      </motion.div>
    </div>
  );
}
