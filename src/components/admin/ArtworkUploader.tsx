"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { ImageGenerationModal, getArtworkTypeFromSlot } from "./ImageGenerationModal";

// Define artwork slot configurations
export const THEME_ARTWORK_SLOTS = [
  { slot: "logo", label: "Logo", description: "Theme logo (recommended: 256x256px)" },
  { slot: "background", label: "Background", description: "Main background image (1920x1080px)" },
  { slot: "mapBackground", label: "Map Background", description: "Story map background (1920x1080px)" },
] as const;

export const CHARACTER_ARTWORK_SLOTS = [
  { slot: "imageUrl", label: "Full Image", description: "Character artwork (512x512px)" },
  { slot: "thumbnailUrl", label: "Thumbnail", description: "Small thumbnail (128x128px)" },
] as const;

export const CAMPAIGN_ARTWORK_SLOTS = [
  { slot: "background", label: "Background", description: "Campaign background" },
  { slot: "introImage", label: "Intro Image", description: "Default mission intro image" },
] as const;

export const MISSION_ARTWORK_SLOTS = [
  { slot: "introImage", label: "Intro Image", description: "Mission intro artwork" },
  { slot: "outroImage", label: "Outro Image", description: "Mission completion artwork" },
] as const;

interface BaseUploaderProps {
  currentUrl?: string | null;
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
  showGenerate?: boolean;
  themeName?: string;
  generatePrompt?: string;
}

interface ThemeArtworkUploaderProps extends BaseUploaderProps {
  targetType: "theme";
  themeId: string;
  slot: "logo" | "background" | "mapBackground";
}

interface CharacterArtworkUploaderProps extends BaseUploaderProps {
  targetType: "character";
  themeId: string;
  characterId: string;
  slot: "imageUrl" | "thumbnailUrl";
}

interface CampaignArtworkUploaderProps extends BaseUploaderProps {
  targetType: "campaign";
  campaignId: string;
  slot: "background" | "introImage";
}

interface MissionArtworkUploaderProps extends BaseUploaderProps {
  targetType: "mission";
  missionId: string;
  slot: "introImage" | "outroImage";
}

type ArtworkUploaderProps =
  | ThemeArtworkUploaderProps
  | CharacterArtworkUploaderProps
  | CampaignArtworkUploaderProps
  | MissionArtworkUploaderProps;

/**
 * Single artwork slot uploader with optional AI generation
 */
export function ArtworkUploader(props: ArtworkUploaderProps) {
  const { currentUrl, onUploadComplete, onUploadError, disabled, showGenerate = true, themeName, generatePrompt } = props;
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload file to API
  const uploadFile = useCallback(
    async (file: File | Blob, isGenerated = false) => {
      setError(null);
      setIsUploading(true);

      // Show preview immediately for files
      let localPreview: string | null = null;
      if (file instanceof File) {
        localPreview = URL.createObjectURL(file);
        setPreviewUrl(localPreview);
      }

      try {
        const formData = new FormData();
        formData.append("file", file, isGenerated ? "generated.png" : undefined);
        formData.append("targetType", props.targetType);
        formData.append("slot", props.slot);

        // Add type-specific fields
        if (props.targetType === "theme") {
          formData.append("themeId", props.themeId);
        } else if (props.targetType === "character") {
          formData.append("themeId", props.themeId);
          formData.append("characterId", props.characterId);
        } else if (props.targetType === "campaign") {
          formData.append("campaignId", props.campaignId);
        } else if (props.targetType === "mission") {
          formData.append("missionId", props.missionId);
        }

        const response = await fetch("/api/admin/artwork", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Upload failed");
        }

        setPreviewUrl(result.url);
        onUploadComplete?.(result.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setPreviewUrl(currentUrl || null);
        onUploadError?.(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsUploading(false);
        // Clean up local preview URL
        if (localPreview) {
          URL.revokeObjectURL(localPreview);
        }
      }
    },
    [props, currentUrl, onUploadComplete, onUploadError]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError("Please select a PNG, JPEG, or WebP image");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      await uploadFile(file);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [uploadFile]
  );

  // Handle generated image from modal
  const handleImageGenerated = useCallback(
    async (imageData: string) => {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();

      // Set preview immediately
      setPreviewUrl(imageData);

      // Upload the generated image
      await uploadFile(blob, true);
    },
    [uploadFile]
  );

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const artworkType = getArtworkTypeFromSlot(props.targetType, props.slot);

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div className="relative">
        <button
          type="button"
          onClick={triggerFileSelect}
          disabled={disabled || isUploading}
          className={`relative w-full aspect-video border-2 border-dashed rounded-xl overflow-hidden transition-all ${
            disabled || isUploading
              ? "border-gray-200 bg-gray-50 cursor-not-allowed"
              : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer"
          }`}
        >
          {previewUrl ? (
            <>
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover"
                unoptimized
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                <span className="text-white font-medium text-sm bg-black/60 px-3 py-1 rounded-lg">
                  Replace
                </span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              {isUploading ? (
                <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
              ) : (
                <>
                  <span className="text-3xl mb-2">📷</span>
                  <span className="text-sm text-gray-500 text-center">
                    Click to upload
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    PNG, JPEG, or WebP (max 5MB)
                  </span>
                </>
              )}
            </div>
          )}
        </button>

        {/* Generate button */}
        {showGenerate && !disabled && (
          <button
            type="button"
            onClick={() => setShowGenerateModal(true)}
            disabled={isUploading}
            className="absolute top-2 right-2 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-lg disabled:opacity-50"
            title="Generate with AI"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Generation Modal */}
      <ImageGenerationModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onImageGenerated={handleImageGenerated}
        artworkType={artworkType}
        themeName={themeName}
        initialPrompt={generatePrompt}
      />
    </div>
  );
}

/**
 * Multi-slot artwork uploader for themes with AI generation
 */
interface ThemeArtworkGridProps {
  themeId: string;
  themeName?: string;
  assets?: {
    logo?: string | null;
    background?: string | null;
    mapBackground?: string | null;
  } | null;
  onUpdate?: () => void;
}

export function ThemeArtworkGrid({ themeId, themeName, assets, onUpdate }: ThemeArtworkGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-700">Theme Artwork</h4>
        <span className="text-xs text-purple-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          AI generation available
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {THEME_ARTWORK_SLOTS.map(({ slot, label, description }) => (
          <div key={slot} className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-600">{label}</label>
            </div>
            <ArtworkUploader
              targetType="theme"
              themeId={themeId}
              slot={slot}
              currentUrl={assets?.[slot]}
              onUploadComplete={onUpdate}
              themeName={themeName}
              generatePrompt={slot === "logo" ? `${themeName || "game"} logo` : undefined}
            />
            <p className="text-xs text-gray-400">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Character artwork uploader with AI generation and existing word lookup
 */
interface CharacterArtworkUploaderGridProps {
  themeId: string;
  characterId: string;
  characterName: string;
  themeName?: string;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  onUpdate?: () => void;
}

interface ExistingWordImage {
  found: boolean;
  emoji?: string;
  imageUrl?: string;
}

export function CharacterArtworkGrid({
  themeId,
  characterId,
  characterName,
  themeName,
  imageUrl,
  thumbnailUrl,
  onUpdate,
}: CharacterArtworkUploaderGridProps) {
  const [existingWordImage, setExistingWordImage] = useState<ExistingWordImage | null>(null);
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);

  // Check for existing word image on mount
  useEffect(() => {
    async function checkExisting() {
      setIsCheckingExisting(true);
      try {
        const response = await fetch(`/api/admin/word-image?word=${encodeURIComponent(characterName)}`);
        if (response.ok) {
          const data = await response.json();
          setExistingWordImage(data);
        }
      } catch {
        // Silently ignore - this is a nice-to-have feature
      } finally {
        setIsCheckingExisting(false);
      }
    }
    checkExisting();
  }, [characterName]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-gray-700">{characterName}</h5>
        <span className="text-xs text-purple-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          AI
        </span>
      </div>

      {/* Show existing word image/emoji if found */}
      {!isCheckingExisting && existingWordImage?.found && (existingWordImage.imageUrl || existingWordImage.emoji) && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-3">
            {existingWordImage.imageUrl ? (
              <img
                src={existingWordImage.imageUrl}
                alt={characterName}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : existingWordImage.emoji ? (
              <span className="text-4xl">{existingWordImage.emoji}</span>
            ) : null}
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Existing word asset found</p>
              <p className="text-xs text-amber-600">
                {existingWordImage.imageUrl ? "Image" : "Emoji"} available for &quot;{characterName}&quot;
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Full Image</label>
          <ArtworkUploader
            targetType="character"
            themeId={themeId}
            characterId={characterId}
            slot="imageUrl"
            currentUrl={imageUrl}
            onUploadComplete={onUpdate}
            themeName={themeName}
            generatePrompt={`${characterName} character portrait`}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Thumbnail</label>
          <ArtworkUploader
            targetType="character"
            themeId={themeId}
            characterId={characterId}
            slot="thumbnailUrl"
            currentUrl={thumbnailUrl}
            onUploadComplete={onUpdate}
            themeName={themeName}
            generatePrompt={`${characterName} character icon`}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Campaign artwork uploader grid with AI generation
 */
interface CampaignArtworkGridProps {
  campaignId: string;
  campaignTitle?: string;
  themeName?: string;
  artwork?: {
    background?: string | null;
    introImage?: string | null;
  } | null;
  onUpdate?: () => void;
}

export function CampaignArtworkGrid({ campaignId, campaignTitle, themeName, artwork, onUpdate }: CampaignArtworkGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-700">Campaign Artwork</h4>
        <span className="text-xs text-purple-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          AI generation available
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CAMPAIGN_ARTWORK_SLOTS.map(({ slot, label, description }) => (
          <div key={slot} className="space-y-2">
            <label className="text-sm font-medium text-gray-600">{label}</label>
            <ArtworkUploader
              targetType="campaign"
              campaignId={campaignId}
              slot={slot}
              currentUrl={artwork?.[slot]}
              onUploadComplete={onUpdate}
              themeName={themeName}
              generatePrompt={campaignTitle ? `${campaignTitle} ${slot === "background" ? "background" : "intro scene"}` : undefined}
            />
            <p className="text-xs text-gray-400">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Mission artwork uploader grid with AI generation
 */
interface MissionArtworkGridProps {
  missionId: string;
  missionTitle?: string;
  themeName?: string;
  artwork?: {
    introImage?: string | null;
    outroImage?: string | null;
  } | null;
  onUpdate?: () => void;
}

export function MissionArtworkGrid({ missionId, missionTitle, themeName, artwork, onUpdate }: MissionArtworkGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-700">Mission Artwork</h4>
        <span className="text-xs text-purple-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          AI generation available
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MISSION_ARTWORK_SLOTS.map(({ slot, label, description }) => (
          <div key={slot} className="space-y-2">
            <label className="text-sm font-medium text-gray-600">{label}</label>
            <ArtworkUploader
              targetType="mission"
              missionId={missionId}
              slot={slot}
              currentUrl={artwork?.[slot]}
              onUploadComplete={onUpdate}
              themeName={themeName}
              generatePrompt={missionTitle ? `${missionTitle} ${slot === "introImage" ? "opening scene" : "victory celebration scene"}` : undefined}
            />
            <p className="text-xs text-gray-400">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
