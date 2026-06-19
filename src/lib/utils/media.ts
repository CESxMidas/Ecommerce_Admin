const DEFAULT_MEDIA_FALLBACK =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&auto=format&fit=crop";

export function resolveMediaUrl(
  url?: string | null,
  fallback: string = DEFAULT_MEDIA_FALLBACK,
): string {
  const trimmed = typeof url === "string" ? url.trim() : "";

  if (!trimmed) {
    return fallback;
  }

  if (trimmed.startsWith("/images/") || trimmed.startsWith("/assets/")) {
    return fallback;
  }

  return trimmed;
}
