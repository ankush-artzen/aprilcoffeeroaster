import type { AdviceArticleDetail } from "lib/advice/advice-article";
import type { AdviceFeedItem, AdviceFeedResponse } from "lib/advice/advice-types";
import {
  getArticleBySlug,
  getArticlesPage,
  isDatoCmsConfigured,
  type DatoArticleRecord,
  type DatoResponsiveImage,
} from "lib/cms/datocms";
import { ADVICE_PAGE_SIZE } from "lib/constants";
import { structuredTextToHtml } from "lib/cms/structured-text";

export { isDatoCmsConfigured };

function externalImageSrcSet(url: string): string {
  const base = url.split("?")[0];
  const widths = [200, 400, 600, 800, 1200, 1600, 2400];
  return widths.map((w) => `${base}?width=${w} ${w}w`).join(", ");
}

function normalizeExternalImageUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function firstImage(
  record: DatoArticleRecord,
): DatoResponsiveImage | null {
  for (const item of record.images) {
    if (item.responsiveImage) return item.responsiveImage;
  }
  return null;
}

function articleGalleryImages(record: DatoArticleRecord) {
  const seenUrls = new Set<string>();
  const gallery = record.images.flatMap((item) => {
    const image = item.responsiveImage;
    if (!image || seenUrls.has(image.src)) return [];
    seenUrls.add(image.src);
    return [
      {
        url: image.src,
        srcSet: image.srcSet,
        width: image.width,
        height: image.height,
      },
    ];
  });

  const externalUrl = normalizeExternalImageUrl(record.externalAssetUrl);
  if (externalUrl && !seenUrls.has(externalUrl)) {
    gallery.push({
      url: externalUrl,
      srcSet: externalImageSrcSet(externalUrl),
      width: 800,
      height: 800,
    });
  }

  return gallery;
}

function recordToFeedItem(record: DatoArticleRecord): AdviceFeedItem | null {
  const image = firstImage(record);
  const externalUrl = normalizeExternalImageUrl(record.externalAssetUrl);
  const imageUrl = image?.src ?? externalUrl;
  if (!imageUrl) return null;

  const width = image?.width || 800;
  const height = image?.height || 800;

  return {
    id: record.id,
    title: record.title,
    path: `/projects/${record.slug}`,
    slug: record.slug,
    image: imageUrl,
    srcSet: image?.srcSet ?? externalImageSrcSet(imageUrl),
    width,
    height,
    aspectRatio: width / height,
    contentType: "advice",
    publishedAt: record.updatedAt ?? undefined,
  };
}

function parseDatoFeedOffset(cursor: string | null | undefined): number {
  if (!cursor) return 0;
  const offset = Number.parseInt(cursor, 10);
  return Number.isFinite(offset) && offset > 0 ? offset : 0;
}

export async function fetchDatoAdviceFeed(options?: {
  cursor?: string | null;
  first?: number;
}): Promise<AdviceFeedResponse> {
  const first = options?.first ?? ADVICE_PAGE_SIZE;
  let skip = parseDatoFeedOffset(options?.cursor);
  const adviceFeed: AdviceFeedItem[] = [];
  let totalCount = 0;

  while (adviceFeed.length < first) {
    const page = await getArticlesPage({ first, skip });
    totalCount = page.totalCount;

    if (page.articles.length === 0) break;

    for (const record of page.articles) {
      const item = recordToFeedItem(record);
      if (item) adviceFeed.push(item);
      if (adviceFeed.length >= first) break;
    }

    skip += page.articles.length;
    if (skip >= totalCount) break;
  }

  const hasNextPage = skip < totalCount;

  return {
    adviceFeed,
    adviceFeedMetadata: {
      count: adviceFeed.length,
      totalCount,
      hasNextPage,
      endCursor: hasNextPage ? String(skip) : null,
    },
  };
}

export async function fetchDatoAdviceDetail(
  slug: string,
): Promise<AdviceArticleDetail | null> {
  const record = await getArticleBySlug(slug);
  if (!record) return null;

  const hero = firstImage(record);
  const contentHtml = structuredTextToHtml(
    record.textDescriptionField?.value,
  );
  const info = record.info?.trim() || undefined;
  const galleryImages = articleGalleryImages(record);
  const externalUrl = normalizeExternalImageUrl(record.externalAssetUrl);

  return {
    title: record.title,
    image: hero
      ? { url: hero.src, altText: record.title }
      : externalUrl
        ? { url: externalUrl, altText: record.title }
        : undefined,
    info,
    contentHtml,
    youtubeVideoId: record.youtubeVideoId,
    galleryImages,
  };
}
