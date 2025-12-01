/**
 * Artwork helper functions for hierarchical artwork system
 *
 * Fallback chain: Mission → Campaign → Theme → Default gradient
 */

import type {
  MissionArtwork,
  CampaignArtwork,
  ThemeAssets,
  ThemeCharacter
} from "./db/schema";

type ArtworkType = "intro" | "outro" | "background";

interface ArtworkParams {
  mission?: { artwork: MissionArtwork | null } | null;
  campaign?: { artwork: CampaignArtwork | null } | null;
  theme?: { assets: ThemeAssets | null; characters: ThemeCharacter[] | null } | null;
}

/**
 * Get artwork URL using hierarchical fallback chain
 *
 * For intro:
 *   mission.artwork.introImage → campaign.artwork.introImage → theme.assets.background → null
 *
 * For outro:
 *   mission.artwork.outroImage → campaign.artwork.introImage → theme.assets.background → null
 *
 * For background:
 *   campaign.artwork.background → theme.assets.background → null
 */
export function getArtworkUrl(
  params: ArtworkParams,
  type: ArtworkType
): string | null {
  const { mission, campaign, theme } = params;

  if (type === "intro") {
    return (
      mission?.artwork?.introImage ??
      campaign?.artwork?.introImage ??
      theme?.assets?.background ??
      null
    );
  }

  if (type === "outro") {
    return (
      mission?.artwork?.outroImage ??
      campaign?.artwork?.introImage ??
      theme?.assets?.background ??
      null
    );
  }

  // background
  return (
    campaign?.artwork?.background ??
    theme?.assets?.background ??
    null
  );
}

/**
 * Get featured character for a mission
 *
 * Fallback chain:
 *   mission.artwork.character → theme's first character → null
 */
export function getFeaturedCharacter(
  params: ArtworkParams
): ThemeCharacter | null {
  const { mission, theme } = params;

  const characterId = mission?.artwork?.character;

  if (characterId && theme?.characters) {
    const character = theme.characters.find(c => c.id === characterId);
    if (character) return character;
  }

  // Fallback to first character
  if (theme?.characters && theme.characters.length > 0) {
    return theme.characters[0];
  }

  return null;
}

/**
 * Check if any artwork is available (for conditional rendering)
 */
export function hasArtwork(params: ArtworkParams, type: ArtworkType): boolean {
  return getArtworkUrl(params, type) !== null;
}

/**
 * Get all artwork URLs for a mission (for preloading)
 */
export function getAllArtworkUrls(params: ArtworkParams): string[] {
  const urls: string[] = [];

  const introUrl = getArtworkUrl(params, "intro");
  const outroUrl = getArtworkUrl(params, "outro");
  const bgUrl = getArtworkUrl(params, "background");

  if (introUrl) urls.push(introUrl);
  if (outroUrl && outroUrl !== introUrl) urls.push(outroUrl);
  if (bgUrl && bgUrl !== introUrl && bgUrl !== outroUrl) urls.push(bgUrl);

  const character = getFeaturedCharacter(params);
  if (character?.imageUrl) urls.push(character.imageUrl);
  if (character?.thumbnailUrl) urls.push(character.thumbnailUrl);

  return urls;
}
