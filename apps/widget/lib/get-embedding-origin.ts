export function getEmbeddingOrigin(): string | undefined {
  if (!document.referrer) return undefined;
  try {
    return new URL(document.referrer).origin;
  } catch {
    return undefined;
  }
}
