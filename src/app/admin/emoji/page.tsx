"use client";

import { useState, useCallback, useRef } from "react";

// Emoji style options
const EMOJI_STYLES = [
  { value: "flat", label: "Flat", description: "Simple vector icons with soft colors" },
  { value: "3d", label: "3D", description: "Claymation style with soft lighting" },
  { value: "pixel", label: "Pixel", description: "8-bit retro game style" },
  { value: "line", label: "Line Art", description: "Black and white minimal sticker" },
] as const;

type EmojiStyle = typeof EMOJI_STYLES[number]["value"];

interface GeneratedEmoji {
  id: string;
  prompt: string;
  style: EmojiStyle;
  imageData: string;
  timestamp: Date;
  saved?: boolean;
  savedUrl?: string;
}

export default function EmojiStudioPage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<EmojiStyle>("flat");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedEmoji[]>([]);
  const [selectedEmoji, setSelectedEmoji] = useState<GeneratedEmoji | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate emoji
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/generate-emoji", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), style }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate emoji");
      }

      const data = await response.json();

      const newEmoji: GeneratedEmoji = {
        id: `emoji-${Date.now()}`,
        prompt: prompt.trim(),
        style,
        imageData: data.imageData,
        timestamp: new Date(),
      };

      setHistory((prev) => [newEmoji, ...prev]);
      setSelectedEmoji(newEmoji);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate emoji");
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, style]);

  // Resize image using canvas
  const resizeImage = useCallback((imageData: string, size: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          reject(new Error("Canvas not available"));
          return;
        }
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }
        ctx.drawImage(img, 0, 0, size, size);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = imageData;
    });
  }, []);

  // Save emoji to Vercel Blob
  const handleSave = useCallback(async (emoji: GeneratedEmoji, filename?: string) => {
    setIsSaving(emoji.id);
    setError(null);

    try {
      // Resize to 128x128 for emoji size
      const resizedImage = await resizeImage(emoji.imageData, 128);

      const safeName = (filename || emoji.prompt)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 30);

      const response = await fetch("/api/admin/upload-emoji", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: resizedImage,
          filename: safeName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save emoji");
      }

      const data = await response.json();

      // Update history with saved URL
      setHistory((prev) =>
        prev.map((e) =>
          e.id === emoji.id ? { ...e, saved: true, savedUrl: data.url } : e
        )
      );

      if (selectedEmoji?.id === emoji.id) {
        setSelectedEmoji((prev) => prev ? { ...prev, saved: true, savedUrl: data.url } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save emoji");
    } finally {
      setIsSaving(null);
    }
  }, [resizeImage, selectedEmoji]);

  // Copy URL to clipboard
  const handleCopyUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Emoji Studio</h1>
        <p className="text-gray-500 mt-1">Generate custom emoji images using AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generator Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="font-semibold text-gray-900 text-lg">Generate New Emoji</h2>

          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What should the emoji show?
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., happy dog, red apple, running child..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
              onKeyDown={(e) => e.key === "Enter" && !isGenerating && handleGenerate()}
            />
          </div>

          {/* Style Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Style
            </label>
            <div className="grid grid-cols-2 gap-3">
              {EMOJI_STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className={`p-3 rounded-xl border-2 text-left transition ${
                    style === s.value
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium text-gray-900">{s.label}</div>
                  <div className="text-xs text-gray-500">{s.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 text-lg"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">✨</span>
                Generating...
              </>
            ) : (
              <>
                <span>✨</span>
                Generate Emoji
              </>
            )}
          </button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg">Preview</h2>

          {selectedEmoji ? (
            <div className="space-y-4">
              {/* Large Preview */}
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={selectedEmoji.imageData}
                    alt={selectedEmoji.prompt}
                    className="w-48 h-48 object-contain rounded-xl border border-gray-200"
                  />
                  {selectedEmoji.saved && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Saved
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="text-center space-y-1">
                <div className="font-medium text-gray-900">{selectedEmoji.prompt}</div>
                <div className="text-sm text-gray-500">
                  Style: {EMOJI_STYLES.find((s) => s.value === selectedEmoji.style)?.label}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {!selectedEmoji.saved ? (
                  <button
                    onClick={() => handleSave(selectedEmoji)}
                    disabled={isSaving === selectedEmoji.id}
                    className="flex-1 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                  >
                    {isSaving === selectedEmoji.id ? "Saving..." : "Save to Library"}
                  </button>
                ) : (
                  <button
                    onClick={() => selectedEmoji.savedUrl && handleCopyUrl(selectedEmoji.savedUrl)}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
                  >
                    Copy URL
                  </button>
                )}
                <button
                  onClick={() => {
                    setPrompt(selectedEmoji.prompt);
                    setStyle(selectedEmoji.style);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Regenerate
                </button>
              </div>

              {selectedEmoji.savedUrl && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Saved URL:</div>
                  <code className="text-xs text-gray-700 break-all">{selectedEmoji.savedUrl}</code>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">🎨</div>
                <div>Generate an emoji to see preview</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 text-lg mb-4">
            Recent Generations ({history.length})
          </h2>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {history.map((emoji) => (
              <button
                key={emoji.id}
                onClick={() => setSelectedEmoji(emoji)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition ${
                  selectedEmoji?.id === emoji.id
                    ? "border-purple-500 ring-2 ring-purple-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <img
                  src={emoji.imageData}
                  alt={emoji.prompt}
                  className="w-full h-full object-cover"
                />
                {emoji.saved && (
                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hidden canvas for resizing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
