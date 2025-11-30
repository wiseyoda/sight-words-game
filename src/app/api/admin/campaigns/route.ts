import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { themes, campaigns, missions, sentences, words } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import type { ThemePalette, ThemeCharacter } from "@/lib/db/schema";

export const runtime = "nodejs";
export const maxDuration = 60; // Allow time for audio generation

// Pre-generate audio for a word via the audio API
async function generateWordAudio(word: string, baseUrl: string): Promise<void> {
  try {
    const normalizedWord = encodeURIComponent(word.toLowerCase().trim());
    // This will trigger on-demand TTS generation and blob storage
    await fetch(`${baseUrl}/api/audio/${normalizedWord}`, {
      method: "GET",
      headers: { Accept: "audio/mpeg" },
    });
  } catch (error) {
    // Log but don't fail the campaign creation
    console.warn(`Failed to pre-generate audio for "${word}":`, error);
  }
}

// GET /api/admin/campaigns - List all campaigns
export async function GET() {
  try {
    const allCampaigns = await db.query.campaigns.findMany({
      with: {
        theme: true,
        missions: {
          with: {
            sentences: true,
          },
        },
      },
      orderBy: [asc(campaigns.title)],
    });

    return NextResponse.json({ campaigns: allCampaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

// POST /api/admin/campaigns - Create a new campaign from AI-generated content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.theme || !body.missions) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get base URL for audio generation
    const baseUrl = request.headers.get("origin") ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    // Collect all unique words for audio pre-generation
    const allWords = new Set<string>();
    for (const mission of body.missions) {
      for (const sentence of mission.sentences || []) {
        for (const word of sentence.orderedWords || []) {
          allWords.add(word.toLowerCase().trim());
        }
      }
    }

    // Create or find theme
    let themeId: string;

    // Check if theme with this name exists
    const existingTheme = await db.query.themes.findFirst({
      where: eq(themes.name, body.theme.name),
    });

    if (existingTheme) {
      themeId = existingTheme.id;
    } else {
      // Create new theme
      const [newTheme] = await db
        .insert(themes)
        .values({
          name: body.theme.name,
          displayName: body.theme.displayName,
          palette: body.theme.palette as ThemePalette,
          characters: (body.characters || []).map((c: { id: string; name: string; description?: string }) => ({
            id: c.id,
            name: c.name,
            imageUrl: "", // Placeholder
            thumbnailUrl: "",
            vocabulary: [],
          })) as ThemeCharacter[],
          isActive: true,
          isCustom: true,
        })
        .returning();

      themeId = newTheme.id;
    }

    // Create campaign
    const [newCampaign] = await db
      .insert(campaigns)
      .values({
        title: body.title,
        synopsis: body.synopsis || "",
        themeId,
        isActive: true,
      })
      .returning();

    // Create missions and sentences
    for (let i = 0; i < body.missions.length; i++) {
      const missionData = body.missions[i];

      // Create mission
      const [newMission] = await db
        .insert(missions)
        .values({
          title: missionData.title,
          type: missionData.type || "play",
          narrativeIntro: missionData.narrativeIntro || "",
          narrativeOutro: missionData.narrativeOutro || "",
          campaignId: newCampaign.id,
          order: i,
          isActive: true,
        })
        .returning();

      // Create sentences for this mission
      if (missionData.sentences && missionData.sentences.length > 0) {
        for (let j = 0; j < missionData.sentences.length; j++) {
          const sentenceData = missionData.sentences[j];

          // Ensure all words exist in the database
          for (const word of sentenceData.orderedWords) {
            const normalizedWord = word.toLowerCase().trim();
            if (normalizedWord) {
              try {
                await db
                  .insert(words)
                  .values({
                    text: normalizedWord,
                    type: "generated",
                    isSightWord: false,
                  })
                  .onConflictDoNothing();
              } catch {
                // Word already exists, that's fine
              }
            }
          }

          // Create sentence
          await db.insert(sentences).values({
            text: sentenceData.text,
            orderedWords: sentenceData.orderedWords,
            distractors: sentenceData.distractors || [],
            missionId: newMission.id,
            order: j,
          });
        }
      }
    }

    // Pre-generate audio for all words (in background, don't block response)
    // Generate in batches to avoid overwhelming the server
    const wordArray = Array.from(allWords);
    const audioGenerationPromise = (async () => {
      const batchSize = 5;
      for (let i = 0; i < wordArray.length; i += batchSize) {
        const batch = wordArray.slice(i, i + batchSize);
        await Promise.all(batch.map(word => generateWordAudio(word, baseUrl)));
      }
    })();

    // Don't await - let it run in background
    audioGenerationPromise.catch(err => {
      console.warn("Background audio generation error:", err);
    });

    // Fetch complete campaign with relations
    const completeCampaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, newCampaign.id),
      with: {
        theme: true,
        missions: {
          with: {
            sentences: true,
          },
        },
      },
    });

    return NextResponse.json({
      campaign: completeCampaign,
      audioStatus: `Generating audio for ${wordArray.length} words in background`,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
