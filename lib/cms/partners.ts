import { gql } from "graphql-request";
import {
  datoRequest,
  isDatoCmsConfigured,
  type DatoResponsiveImage,
  type DatoStructuredTextValue,
} from "lib/cms/datocms";
import { structuredTextToHtml } from "lib/cms/structured-text";
import { PARTNERS_PAGE_SIZE } from "lib/constants";

export { isDatoCmsConfigured };

/**
 * DatoCMS setup:
 *
 * Model API key: `partner`
 * GraphQL: PartnerRecord / allPartners / partner
 *
 * Fields (API keys → GraphQL):
 *   title            — partner / wholesaler name
 *   slug             — URL slug (`/partners/{slug}`)
 *   country          — used for alphabetical country grouping
 *   address          — shown on card hover and detail sidebar
 *   info             — optional detail sidebar text (falls back to address)
 *   cover_image      — listing image (falls back to first of images / image_url)
 *   images           — gallery photos on the detail page
 *   image_url        — multi-paragraph text; one https image URL per line
 *   story            — structured text partnership story / description
 */

export type PartnerImage = {
  src: string;
  srcSet?: string;
  width: number;
  height: number;
  /** True when sourced from `image_url` (not a DatoCMS asset). */
  external?: boolean;
};

export type PartnerListItem = {
  id: string;
  title: string;
  slug: string;
  href: string;
  country: string;
  address: string | null;
  image: PartnerImage;
};

export type PartnerDetail = {
  id: string;
  title: string;
  slug: string;
  country: string;
  address: string | null;
  info: string | null;
  contentHtml: string | null;
  images: PartnerImage[];
};

export type PartnerCountryGroup = {
  country: string;
  partners: PartnerListItem[];
};

export type PartnersFeedMetadata = {
  count: number;
  totalCount: number;
  hasNextPage: boolean;
  endCursor: string | null;
};

export type PartnersFeedResponse = {
  partners: PartnerListItem[];
  partnersMetadata: PartnersFeedMetadata;
};

type DatoPartnerRecordRaw = {
  id: string;
  title: string;
  slug: string;
  country: string | null;
  address: string | null;
  info: string | null;
  coverImage: { responsiveImage: DatoResponsiveImage | null } | null;
  images: Array<{ responsiveImage: DatoResponsiveImage | null }>;
  imageUrl: string | null;
  story: { value: DatoStructuredTextValue } | null;
};

const partnerFields = gql`
  fragment PartnerFields on PartnerRecord {
    id
    title
    slug
    country
    address
    info
    coverImage {
      responsiveImage(imgixParams: { fit: crop, w: 800, auto: format }) {
        src
        width
        height
        srcSet
        webpSrcSet
      }
    }
    images {
      responsiveImage(imgixParams: { fit: crop, w: 800, auto: format }) {
        src
        width
        height
        srcSet
        webpSrcSet
      }
    }
    imageUrl
    story {
      value
    }
  }
`;

function isMissingPartnerModel(error: unknown): boolean {
  const response = (error as { response?: { errors?: unknown } })?.response;
  const errors = response?.errors;
  if (!Array.isArray(errors)) return false;

  return errors.some((entry) => {
    const message =
      typeof entry === "object" &&
      entry &&
      "message" in entry &&
      typeof (entry as { message?: unknown }).message === "string"
        ? (entry as { message: string }).message
        : "";
    return /partner/i.test(message) && /exist|undefined|unknown/i.test(message);
  });
}

function responsiveToImage(
  responsive: DatoResponsiveImage | null | undefined,
): PartnerImage | null {
  if (!responsive?.src) return null;
  return {
    src: responsive.src,
    srcSet: responsive.srcSet,
    width: responsive.width || 800,
    height: responsive.height || 1000,
  };
}

function normalizeExternalImageUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

/** One URL per line (or paragraph) from the `image_url` text field. */
function parseImageUrls(value: string | null | undefined): PartnerImage[] {
  if (!value?.trim()) return [];

  return value
    .split(/\n+/)
    .map((line) => normalizeExternalImageUrl(line))
    .filter((url): url is string => Boolean(url))
    .map((src) => ({
      src,
      width: 800,
      height: 1000,
      external: true,
    }));
}

function partnerImages(raw: DatoPartnerRecordRaw): PartnerImage[] {
  const images: PartnerImage[] = [];
  const seen = new Set<string>();

  const add = (image: PartnerImage | null) => {
    if (!image || seen.has(image.src)) return;
    seen.add(image.src);
    images.push(image);
  };

  add(responsiveToImage(raw.coverImage?.responsiveImage));
  for (const item of raw.images ?? []) {
    add(responsiveToImage(item.responsiveImage));
  }
  for (const image of parseImageUrls(raw.imageUrl)) {
    add(image);
  }

  return images;
}

function normalizeListItem(raw: DatoPartnerRecordRaw): PartnerListItem | null {
  const images = partnerImages(raw);
  const image = images[0];
  if (!image || !raw.slug?.trim() || !raw.title?.trim()) return null;

  const country = raw.country?.trim() || "Other";

  return {
    id: raw.id,
    title: raw.title.trim(),
    slug: raw.slug.trim(),
    href: `/partners/${raw.slug.trim()}`,
    country,
    address: raw.address?.trim() || null,
    image,
  };
}

function normalizeDetail(raw: DatoPartnerRecordRaw): PartnerDetail {
  const contentHtml = structuredTextToHtml(raw.story?.value ?? null);

  return {
    id: raw.id,
    title: raw.title.trim(),
    slug: raw.slug.trim(),
    country: raw.country?.trim() || "Other",
    address: raw.address?.trim() || null,
    info: raw.info?.trim() || null,
    contentHtml: contentHtml || null,
    images: partnerImages(raw),
  };
}

function comparePartners(a: PartnerListItem, b: PartnerListItem): number {
  const byCountry = a.country.localeCompare(b.country, undefined, {
    sensitivity: "base",
  });
  if (byCountry !== 0) return byCountry;
  return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
}

/** Sort by country A–Z, then partner name A–Z, and group into country sections. */
export function groupPartnersByCountry(
  partners: PartnerListItem[],
): PartnerCountryGroup[] {
  const sorted = [...partners].sort(comparePartners);
  const groups: PartnerCountryGroup[] = [];

  for (const partner of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.country === partner.country) {
      last.partners.push(partner);
    } else {
      groups.push({ country: partner.country, partners: [partner] });
    }
  }

  return groups;
}

function parsePartnersFeedOffset(cursor: string | null | undefined): number {
  if (!cursor) return 0;
  const offset = Number.parseInt(cursor, 10);
  return Number.isFinite(offset) && offset > 0 ? offset : 0;
}

async function fetchPartnersPageFromDato(options: {
  first: number;
  skip: number;
}): Promise<{ partners: DatoPartnerRecordRaw[]; totalCount: number }> {
  const query = gql`
    ${partnerFields}
    query PartnersPage($first: IntType!, $skip: IntType!) {
      allPartners(
        first: $first
        skip: $skip
        orderBy: [country_ASC, title_ASC]
      ) {
        ...PartnerFields
      }
      _allPartnersMeta {
        count
      }
    }
  `;

  const data = await datoRequest<{
    allPartners: DatoPartnerRecordRaw[];
    _allPartnersMeta: { count: number };
  }>(query, { first: options.first, skip: options.skip });

  return {
    partners: data.allPartners,
    totalCount: data._allPartnersMeta.count,
  };
}

async function fetchAllPartnersFromDato(): Promise<PartnerListItem[]> {
  const pageSize = 100;
  const partners: PartnerListItem[] = [];
  let skip = 0;
  let totalCount = Number.POSITIVE_INFINITY;

  while (skip < totalCount) {
    const page = await fetchPartnersPageFromDato({ first: pageSize, skip });
    totalCount = page.totalCount;

    if (page.partners.length === 0) break;

    for (const raw of page.partners) {
      const item = normalizeListItem(raw);
      if (item) partners.push(item);
    }

    skip += page.partners.length;
  }

  return partners.sort(comparePartners);
}

async function fetchPartnersFeedFromDato(options?: {
  cursor?: string | null;
  first?: number;
}): Promise<PartnersFeedResponse> {
  const first = options?.first ?? PARTNERS_PAGE_SIZE;
  let skip = parsePartnersFeedOffset(options?.cursor);
  const partners: PartnerListItem[] = [];
  let totalCount = 0;

  while (partners.length < first) {
    const page = await fetchPartnersPageFromDato({ first, skip });
    totalCount = page.totalCount;

    if (page.partners.length === 0) break;

    for (const raw of page.partners) {
      const item = normalizeListItem(raw);
      if (item) partners.push(item);
      if (partners.length >= first) break;
    }

    skip += page.partners.length;
    if (skip >= totalCount) break;
  }

  const hasNextPage = skip < totalCount;

  return {
    partners,
    partnersMetadata: {
      count: partners.length,
      totalCount,
      hasNextPage,
      endCursor: hasNextPage ? String(skip) : null,
    },
  };
}

async function fetchPartnerBySlugFromDato(
  slug: string,
): Promise<PartnerDetail | null> {
  const query = gql`
    ${partnerFields}
    query Partner($slug: String!) {
      partner(filter: { slug: { eq: $slug } }) {
        ...PartnerFields
      }
    }
  `;

  const data = await datoRequest<{
    partner: DatoPartnerRecordRaw | null;
  }>(query, { slug });

  return data.partner ? normalizeDetail(data.partner) : null;
}

/** Returns partners from DatoCMS. Empty when unset, missing model, or no records. */
export async function getAllPartners(): Promise<PartnerListItem[]> {
  if (!isDatoCmsConfigured()) {
    return [];
  }

  try {
    return await fetchAllPartnersFromDato();
  } catch (error) {
    if (isMissingPartnerModel(error)) {
      if (process.env.NODE_ENV === "development") {
        console.warn("DatoCMS partner model not found.");
      }
      return [];
    }
    throw error;
  }
}

/** Paginated partners feed (country A–Z, then title A–Z). */
export async function getPartnersFeed(options?: {
  cursor?: string | null;
  first?: number;
}): Promise<PartnersFeedResponse> {
  if (!isDatoCmsConfigured()) {
    return {
      partners: [],
      partnersMetadata: {
        count: 0,
        totalCount: 0,
        hasNextPage: false,
        endCursor: null,
      },
    };
  }

  try {
    return await fetchPartnersFeedFromDato(options);
  } catch (error) {
    if (isMissingPartnerModel(error)) {
      if (process.env.NODE_ENV === "development") {
        console.warn("DatoCMS partner model not found.");
      }
      return {
        partners: [],
        partnersMetadata: {
          count: 0,
          totalCount: 0,
          hasNextPage: false,
          endCursor: null,
        },
      };
    }
    throw error;
  }
}

export async function getPartnerBySlug(
  slug: string,
): Promise<PartnerDetail | null> {
  if (!isDatoCmsConfigured()) {
    return null;
  }

  try {
    return await fetchPartnerBySlugFromDato(slug);
  } catch (error) {
    if (isMissingPartnerModel(error)) {
      if (process.env.NODE_ENV === "development") {
        console.warn("DatoCMS partner model not found.");
      }
      return null;
    }
    throw error;
  }
}

export async function getPartnerCountryGroups(): Promise<PartnerCountryGroup[]> {
  const partners = await getAllPartners();
  return groupPartnersByCountry(partners);
}
