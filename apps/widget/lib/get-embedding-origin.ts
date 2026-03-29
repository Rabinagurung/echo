export function getEmbeddingOrigin(): string | undefined {
  const raw =
    document.referrer || window.location.ancestorOrigins?.[0];
  if (!raw) return undefined;
  try {
    return new URL(raw).origin;
  } catch {
    return undefined;
  }
}
