/**
 * Check whether a given origin is allowed by the configured domain list.
 *
 * Supports exact hostname match (e.g. "example.com") and wildcard subdomains
 * (e.g. "*.example.com" matches "app.example.com" but not "example.com" itself).
 *
 * Returns `true` if `allowedDomains` is empty/undefined (backwards-compatible open access).
 */
export function isOriginAllowed(
  origin: string,
  allowedDomains: string[] | undefined,
): boolean {
  if (!allowedDomains || allowedDomains.length === 0) return true;

  let hostname: string;
  try {
    hostname = new URL(origin).hostname;
  } catch {
    return false;
  }

  return allowedDomains.some((domain) => {
    const d = domain.trim().toLowerCase();
    if (d.startsWith("*.")) {
      const base = d.slice(2); // e.g. "example.com"
      return hostname === base || hostname.endsWith("." + base);
    }
    // If the allowed domain is a full URL (e.g. "http://localhost:3000"),
    // compare the full origin (scheme + host + port) instead of just hostname.
    if (d.startsWith("http://") || d.startsWith("https://")) {
      try {
        return origin === new URL(d).origin;
      } catch {
        return false;
      }
    }
    return hostname === d;
  });
}
