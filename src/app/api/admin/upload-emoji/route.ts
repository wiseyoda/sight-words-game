import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

// POST /api/admin/upload-emoji
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageData, filename } = body;

    if (!imageData || typeof imageData !== "string") {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    if (!filename || typeof filename !== "string") {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    // Validate filename format
    const safeFilename = filename
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 50);

    if (!safeFilename) {
      return NextResponse.json(
        { error: "Invalid filename" },
        { status: 400 }
      );
    }

    const blobToken = process.env.SWG_READ_WRITE_TOKEN;
    if (!blobToken) {
      console.error("SWG_READ_WRITE_TOKEN not configured");
      return NextResponse.json(
        { error: "Blob storage not configured" },
        { status: 500 }
      );
    }

    // Extract base64 data from data URL
    const base64Match = imageData.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
    if (!base64Match) {
      return NextResponse.json(
        { error: "Invalid image data format" },
        { status: 400 }
      );
    }

    const [, imageType, base64Data] = base64Match;
    const buffer = Buffer.from(base64Data, "base64");

    // Limit file size to 1MB
    if (buffer.length > 1024 * 1024) {
      return NextResponse.json(
        { error: "Image too large (max 1MB)" },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blobPath = `emoji/${safeFilename}.${imageType === "jpeg" ? "jpg" : imageType}`;
    const blob = await put(blobPath, buffer, {
      access: "public",
      token: blobToken,
      contentType: `image/${imageType}`,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: blobPath,
    });
  } catch (error) {
    console.error("Error uploading emoji:", error);
    return NextResponse.json(
      { error: "Failed to upload emoji" },
      { status: 500 }
    );
  }
}
