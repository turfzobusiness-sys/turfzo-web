// Turnstile helpers — single place for site-key checks.
// Server secret (TURNSTILE_SECRET_KEY) never touches the browser; it lives in
// Convex env (contact:submitContact) and Workers secrets (app/api/turnstile/verify).

const PLACEHOLDER = "0x4AAAAAAA-placeholder";

export function getTurnstileSiteKey(): string {
  return (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "").trim();
}

/** True when a real site key is configured (placeholder counts as unset). */
export function isTurnstileConfigured(): boolean {
  const key = getTurnstileSiteKey();
  return key.length > 0 && key !== PLACEHOLDER && !key.includes("placeholder");
}

/**
 * Verify a Turnstile token via the Workers-side API route.
 * Browser → /api/turnstile/verify → siteverify. Never call siteverify from the browser.
 */
export async function verifyTurnstileToken(
  token: string,
  action: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/turnstile/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action }),
    });
    if (res.ok) return { ok: true };
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: data?.error ?? "Bot verification failed." };
  } catch {
    return { ok: false, error: "Bot verification failed. Please try again." };
  }
}
