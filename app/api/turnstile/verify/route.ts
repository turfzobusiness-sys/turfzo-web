import { NextResponse } from "next/server";

// POST /api/turnstile/verify — browser → Workers → siteverify.
// Body: { token: string, action: "signup" | "login" | "contact" }
const ALLOWED_ACTIONS: Record<string, true> = { signup: true, login: true, contact: true };


function expectedHostnames(): Set<string> {
  const raw =
    process.env.TURNSTILE_HOSTNAMES ??
    "turfzo.app,www.turfzo.app,turfzo-web.turfzobusiness.workers.dev,turfzo-web-staging.turfzobusiness.workers.dev";
  return new Set(
    raw
      .split(",")
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function POST(req: Request) {
  const secret = (process.env.TURNSTILE_SECRET_KEY ?? "").trim();
  if (!secret) {
    console.warn("[turnstile] TURNSTILE_SECRET_KEY not set — skipping verification (dev only).");
    return NextResponse.json({ ok: true, skipped: true });
  }

  let body: { token?: unknown; action?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { token, action } = body;
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return NextResponse.json({ error: "Bot verification is required." }, { status: 403 });
  }
  if (typeof action !== "string" || !ALLOWED_ACTIONS[action]) {
    return NextResponse.json({ error: "Invalid action." }, { status: 403 });
  }

  const hostnames = expectedHostnames();
  if (hostnames.size === 0) {
    return NextResponse.json({ error: "Server misconfigured." }, { status: 500 });
  }

  const forwarded = req.headers.get("x-forwarded-for");
  const remoteip = forwarded?.split(",")[0]?.trim() || undefined;

  let result: { success?: boolean; action?: string; hostname?: string };
  try {
    const params = new URLSearchParams({ secret, response: token });
    if (remoteip) params.set("remoteip", remoteip);
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) throw new Error(`siteverify ${r.status}`);
    result = (await r.json()) as typeof result;
  } catch {
    return NextResponse.json({ error: "Bot verification failed." }, { status: 403 });
  }

  if (
    result.success !== true ||
    result.action !== action ||
    !result.hostname ||
    !hostnames.has(result.hostname.toLowerCase())
  ) {
    return NextResponse.json({ error: "Bot verification failed." }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
