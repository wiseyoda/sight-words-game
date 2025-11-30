import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { themes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allThemes = await db.query.themes.findMany({
      where: eq(themes.isActive, true),
    });

    return NextResponse.json({ themes: allThemes });
  } catch (error) {
    console.error("Error fetching themes:", error);
    return NextResponse.json(
      { error: "Failed to fetch themes" },
      { status: 500 }
    );
  }
}
