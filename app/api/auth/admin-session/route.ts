import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "@/lib/convex";

/**
 * W3: mints an httpOnly admin-session cookie ONLY after the caller's
 * Firebase ID token resolves to an admin user in Convex. The backend
 * `admin:*` role checks remain authoritative; this cookie adds a
 * server-side gate so admin pages are not served to non-admins.
 */
const ADMIN_COOKIE = "tz_admin_verified";
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 6; // 6 hours

export async function POST(request: NextRequest) {
  let idToken: string;
  try {
    const body = (await request.json()) as { idToken?: unknown };
    idToken = typeof body?.idToken === "string" ? body.idToken : "";
  } catch {
    idToken = "";
  }

  if (!idToken || idToken.length > 4096) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let session;
  try {
    session = await new ConvexHttpClient().action<{
      success: boolean;
      user?: { role?: string };
    }>("auth:getCurrentUser", {}, idToken);
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (!session?.success || session.user?.role !== "admin") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return response;
}
