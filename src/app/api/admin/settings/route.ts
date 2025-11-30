import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appSettings, type AppSettingsData } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

const SETTINGS_KEY = "app_config";

const DEFAULT_SETTINGS: AppSettingsData = {
  ttsVoice: "nova",
  speechSpeed: 0.9,
  sentenceGeneratorModel: "gpt-4o",
  validationModel: "gpt-4o-mini",
  campaignGeneratorModel: "gpt-4o",
};

// GET /api/admin/settings - Get app settings
export async function GET() {
  try {
    const existing = await db.query.appSettings.findFirst({
      where: eq(appSettings.key, SETTINGS_KEY),
    });

    if (existing) {
      return NextResponse.json({ settings: existing.value });
    }

    // Return defaults if no settings exist
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings - Update app settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate and sanitize settings
    const settings: AppSettingsData = {
      ttsVoice: ["nova", "alloy", "echo", "fable", "onyx", "shimmer"].includes(body.ttsVoice)
        ? body.ttsVoice
        : DEFAULT_SETTINGS.ttsVoice,
      speechSpeed: typeof body.speechSpeed === "number" && body.speechSpeed >= 0.5 && body.speechSpeed <= 1.5
        ? body.speechSpeed
        : DEFAULT_SETTINGS.speechSpeed,
      sentenceGeneratorModel: typeof body.sentenceGeneratorModel === "string"
        ? body.sentenceGeneratorModel
        : DEFAULT_SETTINGS.sentenceGeneratorModel,
      validationModel: typeof body.validationModel === "string"
        ? body.validationModel
        : DEFAULT_SETTINGS.validationModel,
      campaignGeneratorModel: typeof body.campaignGeneratorModel === "string"
        ? body.campaignGeneratorModel
        : DEFAULT_SETTINGS.campaignGeneratorModel,
    };

    // Upsert settings
    const existing = await db.query.appSettings.findFirst({
      where: eq(appSettings.key, SETTINGS_KEY),
    });

    if (existing) {
      await db
        .update(appSettings)
        .set({ value: settings, updatedAt: new Date() })
        .where(eq(appSettings.key, SETTINGS_KEY));
    } else {
      await db.insert(appSettings).values({
        key: SETTINGS_KEY,
        value: settings,
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
