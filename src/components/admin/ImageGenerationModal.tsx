"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";

// Artwork type configurations
const ARTWORK_CONFIGS = {
  logo: {
    label: "Logo",
    description: "Theme logo (256x256)",
    styles: [
      { value: "cartoon", label: "Cartoon", description: "Vibrant, bold outlines" },
      { value: "modern", label: "Modern", description: "Clean, minimal" },
      { value: "playful", label: "Playful", description: "Rounded, friendly" },
    ],
    defaultPrompt: "game logo",
  },
  background: {
    label: "Background",
    description: "Game background (1920x1080)",
    styles: [
      { value: "scenic", label: "Scenic", description: "Landscape, dreamy" },
      { value: "abstract", label: "Abstract", description: "Colorful patterns" },
      { value: "illustrated", label: "Illustrated", description: "Storybook style" },
    ],
    defaultPrompt: "colorful game background",
  },
  mapBackground: {
    label: "Map Background",
    description: "Story map (1920x1080)",
    styles: [
      { value: "treasure", label: "Treasure Map", description: "Parchment, paths" },
      { value: "world", label: "World Map", description: "Colorful regions" },
      { value: "journey", label: "Journey Map", description: "Adventure paths" },
    ],
    defaultPrompt: "adventure map with paths",
  },
  character: {
    label: "Character",
    description: "Character portrait (512x512)",
    styles: [
      { value: "cartoon", label: "Cartoon", description: "Vibrant, expressive" },
      { value: "3d", label: "3D Pixar", description: "Soft lighting, friendly" },
      { value: "anime", label: "Anime", description: "Big eyes, dynamic" },
    ],
    defaultPrompt: "friendly character",
  },
  thumbnail: {
    label: "Thumbnail",
    description: "Character icon (128x128)",
    styles: [
      { value: "icon", label: "Icon", description: "Simple, bold" },
      { value: "avatar", label: "Avatar", description: "Friendly face" },
    ],
    defaultPrompt: "character face icon",
  },
  scene: {
    label: "Scene",
    description: "Story scene (1280x720)",
    styles: [
      { value: "storybook", label: "Storybook", description: "Warm, magical" },
      { value: "cinematic", label: "Cinematic", description: "Dramatic, adventure" },
      { value: "whimsical", label: "Whimsical", description: "Fantasy, bright" },
    ],
    defaultPrompt: "story scene",
  },
} as const;

type ArtworkType = keyof typeof ARTWORK_CONFIGS;

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageGenerated: (imageData: string) => void;
  artworkType: ArtworkType;
  themeName?: string;
  initialPrompt?: string;
}

export function ImageGenerationModal({
  isOpen,
  onClose,
  onImageGenerated,
  artworkType,
  themeName,
  initialPrompt,
}: ImageGenerationModalProps) {
  const config = ARTWORK_CONFIGS[artworkType];
  const [prompt, setPrompt] = useState(initialPrompt || config.defaultPrompt);
  const [style, setStyle] = useState<string>(config.styles[0].value);
  const [customStyle, setCustomStyle] = useState("");
  const [useCustomStyle, setUseCustomStyle] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ imageData: string; prompt: string }>>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Reset when modal opens with new type
  useEffect(() => {
    if (isOpen) {
      setPrompt(initialPrompt || config.defaultPrompt);
      setStyle(config.styles[0].value);
      setGeneratedImage(null);
      setError(null);
    }
  }, [isOpen, artworkType, initialPrompt, config]);

  // Generate artwork
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/generate-artwork", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          artworkType,
          style: useCustomStyle ? undefined : style,
          customStyle: useCustomStyle ? customStyle : undefined,
          themeName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate artwork");
      }

      const data = await response.json();
      setGeneratedImage(data.imageData);
      setHistory((prev) => [{ imageData: data.imageData, prompt: prompt.trim() }, ...prev].slice(0, 8));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate artwork");
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, artworkType, style, customStyle, useCustomStyle, themeName]);

  // Use generated image
  const handleUseImage = useCallback(() => {
    if (generatedImage) {
      onImageGenerated(generatedImage);
      onClose();
    }
  }, [generatedImage, onImageGenerated, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-500 to-indigo-600">
          <div>
            <h2 className="text-xl font-bold text-white">Generate {config.label}</h2>
            <p className="text-purple-100 text-sm">{config.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generator Panel */}
            <div className="space-y-5">
              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe what you want to generate
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`e.g., ${config.defaultPrompt}`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  rows={3}
                />
              </div>

              {/* Style Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Style</label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={useCustomStyle}
                      onChange={(e) => setUseCustomStyle(e.target.checked)}
                      className="rounded text-purple-600"
                    />
                    <span className="text-gray-600">Custom style</span>
                  </label>
                </div>

                {useCustomStyle ? (
                  <textarea
                    value={customStyle}
                    onChange={(e) => setCustomStyle(e.target.value)}
                    placeholder="Enter custom style instructions..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-sm"
                    rows={2}
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {config.styles.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setStyle(s.value)}
                        className={`p-3 rounded-xl border-2 text-left transition ${
                          style === s.value
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{s.label}</span>
                          <span className="text-xs text-gray-500">{s.description}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </span>
                    Generating...
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    Generate Image
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
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Preview</h3>

              {generatedImage ? (
                <div className="space-y-4">
                  {/* Large Preview */}
                  <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                    <Image
                      src={generatedImage}
                      alt="Generated artwork"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleUseImage}
                      className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition"
                    >
                      Use This Image
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              ) : (
                <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center p-6">
                    <div className="text-5xl mb-3">🎨</div>
                    <p className="text-gray-500">
                      Enter a prompt and click Generate
                    </p>
                  </div>
                </div>
              )}

              {/* History */}
              {history.length > 1 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recent</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {history.slice(1).map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setGeneratedImage(item.imageData)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                          generatedImage === item.imageData
                            ? "border-purple-500"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Image
                          src={item.imageData}
                          alt={item.prompt}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden canvas for resizing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}

// Mapping from artwork uploader slots to generation types
export function getArtworkTypeFromSlot(
  targetType: "theme" | "character" | "campaign" | "mission",
  slot: string
): ArtworkType {
  if (targetType === "theme") {
    if (slot === "logo") return "logo";
    if (slot === "background") return "background";
    if (slot === "mapBackground") return "mapBackground";
  }
  if (targetType === "character") {
    if (slot === "imageUrl") return "character";
    if (slot === "thumbnailUrl") return "thumbnail";
  }
  if (targetType === "campaign" || targetType === "mission") {
    if (slot === "background") return "background";
    return "scene";
  }
  return "character"; // Default fallback
}
