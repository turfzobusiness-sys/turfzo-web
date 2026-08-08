/**
 * Safe post-auth redirect target.
 *
 * Only internal paths are allowed. Rejects scheme-ful URLs
 * ("https://evil.example"), protocol-relative URLs ("//evil.example")
 * and anything with a scheme separator, which would otherwise turn the
 * `?redirect=` param into an open redirect.
 */
export function safeRedirectTarget(value: string | null | undefined): string | null {
  if (!value) return null;
  const candidate = value.trim();
  if (!candidate.startsWith("/")) return null;
  if (candidate.startsWith("//")) return null;
  if (candidate.includes(":")) return null;
  if (candidate.includes("\\")) return null;
  if (candidate.includes("\n") || candidate.includes("\r")) return null;
  return candidate;
}
