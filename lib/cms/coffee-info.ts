import { gql } from "graphql-request";
import {
  datoRequest,
  isDatoCmsConfigured,
  type DatoResponsiveImage,
} from "lib/cms/datocms";
import type {
  CoffeeInfoCoffee,
  CoffeeInfoFarm,
  CoffeeInfoPhoto,
  CoffeeInfoVideo,
} from "lib/coffee-info/content";

export { isDatoCmsConfigured };

/**
 * DatoCMS setup (minimal):
 *
 * Model API key: `coffee_farm`
 * Block API key: `coffee_farm_coffee`
 *
 * coffee_farm:
 *   title, slug, description, generalinformation, photos, image_url, video_url, coffees
 *
 * image_url: Multiple-paragraph text — one image URL per line (optional; merged with photos)
 * video_url: External Video (YouTube / Vimeo)
 *
 * coffee_farm_coffee:
 *   name, recipefilter, recipeespresso, lotinformations
 */

type DatoCoffeeFarmCoffeeRaw = {
  name: string | null;
  recipefilter: string | null;
  recipeespresso: string | null;
  lotinformations: string | null;
};

type DatoExternalVideoRaw = {
  url: string | null;
  title: string | null;
  provider: string | null;
  providerUid: string | null;
  thumbnailUrl: string | null;
} | null;

type DatoCoffeeFarmRecordRaw = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  generalinformation: string | null;
  photos: Array<{
    alt: string | null;
    url: string | null;
    responsiveImage: DatoResponsiveImage | null;
  }>;
  /** One image URL per line (Dato field API key: image_url → GraphQL imageUrl). */
  imageUrl: string | null;
  /** External video (Dato field API key: video_url → GraphQL videoUrl). */
  videoUrl: DatoExternalVideoRaw;
  coffees: DatoCoffeeFarmCoffeeRaw[];
};

const coffeeFarmFields = gql`
  fragment CoffeeFarmFields on CoffeeFarmRecord {
    id
    title
    slug
    description
    generalinformation
    photos {
      alt
      url
      responsiveImage(imgixParams: { fit: crop, w: 800, auto: format }) {
        src
        width
        height
        srcSet
        webpSrcSet
      }
    }
    imageUrl
    videoUrl {
      url
      title
      provider
      providerUid
      thumbnailUrl
    }
    coffees {
      ... on CoffeeFarmCoffeeRecord {
        name
        recipefilter
        recipeespresso
        lotinformations
      }
    }
  }
`;

function parsePhotoUrls(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];

  // Supports one URL per line, or comma / space separated URLs in image_url
  const matches = value.match(/https?:\/\/[^\s,<>"']+/gi);
  if (!matches?.length) return [];

  return [
    ...new Set(
      matches.map((url) => url.replace(/[.,;)\]]+$/g, "").trim()).filter(Boolean),
    ),
  ];
}

function buildPhotos(raw: DatoCoffeeFarmRecordRaw): CoffeeInfoPhoto[] {
  const photos: CoffeeInfoPhoto[] = [];
  const seen = new Set<string>();

  const add = (src: string, fullSrc: string, alt: string) => {
    if (!src || seen.has(src)) return;
    seen.add(src);
    photos.push({ src, fullSrc: fullSrc || src, alt });
  };

  for (const item of raw.photos ?? []) {
    const src = item.responsiveImage?.src ?? item.url;
    if (!src) continue;
    add(src, item.url || src, item.alt?.trim() || raw.title);
  }

  for (const url of parsePhotoUrls(raw.imageUrl)) {
    add(url, url, raw.title);
  }

  return photos;
}

function buildVideo(raw: DatoCoffeeFarmRecordRaw): CoffeeInfoVideo | null {
  const video = raw.videoUrl;
  const providerUid = video?.providerUid?.trim();
  const url = video?.url?.trim();
  if (!providerUid && !url) return null;

  return {
    url: url || "",
    title: video?.title?.trim() || raw.title,
    provider: video?.provider?.trim().toLowerCase() || "youtube",
    providerUid: providerUid || "",
    thumbnailUrl: video?.thumbnailUrl?.trim() || null,
  };
}

function buildCoffees(raw: DatoCoffeeFarmRecordRaw): CoffeeInfoCoffee[] {
  return (raw.coffees ?? [])
    .map((coffee) => {
      const name = coffee.name?.trim();
      if (!name) return null;
      return {
        name,
        recipeFilter: coffee.recipefilter?.trim() || "",
        recipeEspresso: coffee.recipeespresso?.trim() || "",
        lotInformation: coffee.lotinformations?.trim() || "",
      };
    })
    .filter((coffee): coffee is CoffeeInfoCoffee => Boolean(coffee));
}

function normalizeCoffeeFarm(raw: DatoCoffeeFarmRecordRaw): CoffeeInfoFarm {
  const title = raw.title.trim().replace(/\s*–\s*$/, "");

  return {
    slug: raw.slug,
    title,
    description: raw.description?.trim() || "",
    generalInformation: raw.generalinformation?.trim() || "",
    photos: buildPhotos(raw),
    video: buildVideo(raw),
    coffees: buildCoffees(raw),
  };
}

function isMissingCoffeeFarmModel(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (
    message.includes("allcoffeefarms") ||
    message.includes("coffeefarm") ||
    message.includes("coffee_farm") ||
    message.includes("undefinedfield")
  ) {
    return true;
  }

  const response = (
    error as {
      response?: {
        errors?: Array<{ extensions?: { code?: string }; message?: string }>;
      };
    }
  ).response;

  return (
    response?.errors?.some(
      (e) =>
        e.extensions?.code === "undefinedField" ||
        e.message?.toLowerCase().includes("coffeefarm") ||
        e.message?.toLowerCase().includes("allcoffeefarms") ||
        e.message?.toLowerCase().includes("coffee_farm"),
    ) ?? false
  );
}

const COFFEE_FARMS_PAGE_SIZE = 100;

async function fetchCoffeeFarmsPageFromDato(options: {
  first: number;
  skip: number;
}): Promise<{ farms: DatoCoffeeFarmRecordRaw[]; totalCount: number }> {
  const query = gql`
    ${coffeeFarmFields}
    query CoffeeFarmsPage($first: IntType!, $skip: IntType!) {
      allCoffeeFarms(first: $first, skip: $skip, orderBy: title_ASC) {
        ...CoffeeFarmFields
      }
      _allCoffeeFarmsMeta {
        count
      }
    }
  `;

  const data = await datoRequest<{
    allCoffeeFarms: DatoCoffeeFarmRecordRaw[];
    _allCoffeeFarmsMeta: { count: number };
  }>(query, { first: options.first, skip: options.skip });

  return {
    farms: data.allCoffeeFarms,
    totalCount: data._allCoffeeFarmsMeta.count,
  };
}

async function fetchAllCoffeeFarmsFromDato(): Promise<CoffeeInfoFarm[]> {
  try {
    const farms: CoffeeInfoFarm[] = [];
    let skip = 0;
    let totalCount = Number.POSITIVE_INFINITY;

    while (skip < totalCount) {
      const page = await fetchCoffeeFarmsPageFromDato({
        first: COFFEE_FARMS_PAGE_SIZE,
        skip,
      });
      totalCount = page.totalCount;

      if (page.farms.length === 0) break;

      for (const raw of page.farms) {
        farms.push(normalizeCoffeeFarm(raw));
      }

      skip += page.farms.length;
    }

    return farms;
  } catch (error) {
    if (isMissingCoffeeFarmModel(error)) {
      return [];
    }
    throw error;
  }
}

async function fetchCoffeeFarmBySlugFromDato(
  slug: string,
): Promise<CoffeeInfoFarm | null> {
  try {
    const query = gql`
      ${coffeeFarmFields}
      query CoffeeFarm($slug: String!) {
        coffeeFarm(filter: { slug: { eq: $slug } }) {
          ...CoffeeFarmFields
        }
      }
    `;

    const data = await datoRequest<{
      coffeeFarm: DatoCoffeeFarmRecordRaw | null;
    }>(query, { slug });

    return data.coffeeFarm ? normalizeCoffeeFarm(data.coffeeFarm) : null;
  } catch (error) {
    if (isMissingCoffeeFarmModel(error)) {
      return null;
    }
    throw error;
  }
}

/** Returns DatoCMS farms only. Empty when unset, missing model, or no records. */
export async function getAllCoffeeInfoFarms(): Promise<CoffeeInfoFarm[]> {
  if (!isDatoCmsConfigured()) {
    return [];
  }

  try {
    return await fetchAllCoffeeFarmsFromDato();
  } catch (error) {
    if (isMissingCoffeeFarmModel(error)) {
      if (process.env.NODE_ENV === "development") {
        console.warn("DatoCMS coffee_farm model not found.");
      }
      return [];
    }
    throw error;
  }
}

export async function getCoffeeInfoFarmBySlug(
  slug: string,
): Promise<CoffeeInfoFarm | null> {
  if (!isDatoCmsConfigured()) {
    return null;
  }

  try {
    return await fetchCoffeeFarmBySlugFromDato(slug);
  } catch (error) {
    if (isMissingCoffeeFarmModel(error)) {
      if (process.env.NODE_ENV === "development") {
        console.warn("DatoCMS coffee_farm model not found.");
      }
      return null;
    }
    throw error;
  }
}

export async function getCoffeeInfoFarmSlugs(): Promise<string[]> {
  const farms = await getAllCoffeeInfoFarms();
  return farms.map((farm) => farm.slug);
}
