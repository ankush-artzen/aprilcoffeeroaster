const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

function firstPathSegmentAfter(
  pathname: string,
  markers: string[],
): string | undefined {
  const parts = pathname.split("/").filter(Boolean);
  const markerIndex = parts.findIndex((part) => markers.includes(part));
  return markerIndex >= 0 ? parts[markerIndex + 1] : undefined;
}

/**
 * Accepts a raw YouTube id or a full watch/embed/youtu.be/shorts URL.
 * Dato's youtubeVideoId field is sometimes stored as a complete URL.
 */
export function youtubeEmbedIdFromValue(
  value: string | null | undefined,
): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;
  if (YOUTUBE_ID_PATTERN.test(trimmed)) return trimmed;

  const fromQuery = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (fromQuery?.[1]) return fromQuery[1];

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      const videoParam = parsed.searchParams.get("v");
      if (videoParam && YOUTUBE_ID_PATTERN.test(videoParam)) {
        return videoParam;
      }

      const nestedId = firstPathSegmentAfter(parsed.pathname, [
        "embed",
        "shorts",
        "live",
        "v",
      ]);
      if (nestedId && YOUTUBE_ID_PATTERN.test(nestedId)) return nestedId;
    }
  } catch {
    // Not a URL — try a last-pass path match below.
  }

  const fromPath = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed|shorts|live|v)\/)([a-zA-Z0-9_-]{11})/,
  );
  return fromPath?.[1] ?? null;
}
