import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_CONTENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const VALID_ASSET_TYPES = ["theme", "campaign", "mission", "character", "general"] as const;
type AssetType = (typeof VALID_ASSET_TYPES)[number];

function isValidAssetType(type: string): type is AssetType {
  return VALID_ASSET_TYPES.includes(type as AssetType);
}

function sanitizeFilename(filename: string): string {
  // Remove path components, keep only the filename
  const basename = filename.split(/[\\/]/).pop() || filename;
  // Remove special characters, keep alphanumeric, dash, underscore, and dot
  return basename
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

function getExtension(contentType: string): string {
  const extensions: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
  };
  return extensions[contentType] || "png";
}

// POST /api/admin/upload - Upload asset to Vercel Blob
export async function POST(request: NextRequest) {
  try {
    const blobToken = process.env.SWG_READ_WRITE_TOKEN;
    if (!blobToken) {
      console.error("SWG_READ_WRITE_TOKEN not configured");
      return NextResponse.json(
        { error: "Blob storage not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const assetType = formData.get("type") as string | null;
    const entityId = formData.get("entityId") as string | null;

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_CONTENT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate asset type
    const type = assetType || "general";
    if (!isValidAssetType(type)) {
      return NextResponse.json(
        { error: `Invalid asset type. Allowed: ${VALID_ASSET_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate entityId if provided
    if (entityId && (typeof entityId !== "string" || entityId.length === 0 || entityId.length > 100)) {
      return NextResponse.json(
        { error: "Invalid entityId" },
        { status: 400 }
      );
    }

    // Build path: assets/{type}/{entityId?}/{timestamp}-{filename}.{ext}
    const timestamp = Date.now();
    const safeFilename = sanitizeFilename(file.name);
    const extension = getExtension(file.type);

    const pathParts = ["assets", type];
    if (entityId) {
      // Sanitize entityId to prevent path traversal
      const safeEntityId = entityId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 50);
      if (safeEntityId) {
        pathParts.push(safeEntityId);
      }
    }
    pathParts.push(`${timestamp}-${safeFilename}.${extension}`);
    const blobPath = pathParts.join("/");

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Vercel Blob
    const blob = await put(blobPath, buffer, {
      access: "public",
      token: blobToken,
      contentType: file.type,
      addRandomSuffix: false,
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
      size: file.size,
    });
  } catch (error) {
    console.error("Error uploading asset:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to upload asset: ${errorMessage}` },
      { status: 500 }
    );
  }
}
