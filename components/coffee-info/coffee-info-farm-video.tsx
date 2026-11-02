import type { CoffeeInfoVideo } from "lib/coffee-info/content";

function youtubeEmbedId(video: CoffeeInfoVideo): string | null {
  if (video.provider === "youtube" && video.providerUid) {
    return video.providerUid;
  }

  if (!video.url) return null;

  try {
    const parsed = new URL(video.url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace(/^\//, "") || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
  } catch {
    return null;
  }

  return null;
}

function vimeoEmbedId(video: CoffeeInfoVideo): string | null {
  if (video.provider === "vimeo" && video.providerUid) {
    return video.providerUid;
  }

  if (!video.url) return null;

  try {
    const parsed = new URL(video.url);
    if (!parsed.hostname.includes("vimeo.com")) return null;
    const match = parsed.pathname.match(/\/(\d+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export function CoffeeInfoFarmVideo({ video }: { video: CoffeeInfoVideo }) {
  const youtubeId = youtubeEmbedId(video);
  const vimeoId = youtubeId ? null : vimeoEmbedId(video);

  const embedSrc = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`
    : vimeoId
      ? `https://player.vimeo.com/video/${vimeoId}`
      : null;

  if (!embedSrc) return null;

  return (
    <div
      aria-label="farm-video-player"
      className="relative mb-8 h-0 w-full overflow-hidden pb-[56.25%]"
    >
      <iframe
        className="absolute left-0 top-0 h-full w-full"
        src={embedSrc}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
