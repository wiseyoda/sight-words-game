import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SESSION_COOKIE = "admin_session";

// Routes that require admin authentication
const PROTECTED_API_ROUTES = [
  "/api/admin/players",
  "/api/admin/words",
  "/api/admin/sentences",
  "/api/admin/campaigns",
  "/api/admin/settings",
  "/api/admin/export",
  "/api/admin/reset-progress",
  "/api/admin/sync-audio",
  "/api/admin/generate-emoji",
  "/api/admin/upload-emoji",
  "/api/admin/themes",
  "/api/admin/cleanup-blobs",
  "/api/ai/generate-sentences",
  "/api/ai/generate-campaign",
];

// Admin pages that need auth (redirect to gate)
const PROTECTED_PAGES = [
  "/admin/players",
  "/admin/progress",
  "/admin/content",
  "/admin/generator",
  "/admin/settings",
];

function isValidSession(sessionCookie: string | undefined): boolean {
  if (!sessionCookie) {
    return false;
  }

  try {
    // Decode URI-encoded cookie value before parsing
    const decodedCookie = decodeURIComponent(sessionCookie);
    const sessionData = JSON.parse(decodedCookie);
    const expiresAt = new Date(sessionData.expiresAt);
    return sessionData.authenticated === true && expiresAt > new Date();
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  // Check if this is a protected API route
  const isProtectedApi = PROTECTED_API_ROUTES.some(
    (route) => pathname.startsWith(route)
  );

  if (isProtectedApi) {
    if (!isValidSession(sessionCookie)) {
      return NextResponse.json(
        { error: "Unauthorized - admin session required" },
        { status: 401 }
      );
    }
  }

  // Check if this is a protected admin page
  const isProtectedPage = PROTECTED_PAGES.some(
    (route) => pathname.startsWith(route)
  );

  if (isProtectedPage) {
    if (!isValidSession(sessionCookie)) {
      // Redirect to admin home (which shows the parental gate)
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/ai/:path*",
  ],
};
