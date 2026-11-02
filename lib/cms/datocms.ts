import { gql } from "graphql-request";

const endpoint = "https://graphql.datocms.com/";
const DATO_CACHE_TAG = "datocms";

export type DatoResponsiveImage = {
  src: string;
  width: number;
  height: number;
  srcSet: string;
  webpSrcSet: string;
};

export type DatoStructuredTextValue = {
  schema: string;
  document: {
    type: string;
    children: unknown[];
  };
};

export type DatoArticleRecord = {
  id: string;
  title: string;
  slug: string;
  updatedAt: string | null;
  youtubeVideoId: string | null;
  info: string | null;
  externalAssetUrl: string | null;
  textDescriptionField: { value: DatoStructuredTextValue } | null;
  images: Array<{ responsiveImage: DatoResponsiveImage | null }>;
};

const articleFields = gql`
  fragment ArticleFields on ArticleRecord {
    id
    title
    slug
    updatedAt: _updatedAt
    youtubeVideoId
    info
    externalAssetUrl
    textDescriptionField {
      value
    }
    images {
      responsiveImage(imgixParams: { fit: crop, w: 800 }) {
        src
        width
        height
        srcSet
        webpSrcSet
      }
    }
  }
`;

export function isDatoCmsConfigured(): boolean {
  return Boolean(process.env.DATOCMS_API_TOKEN?.trim());
}

export function datoCacheTag(): string {
  return DATO_CACHE_TAG;
}

export async function datoRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const token = process.env.DATOCMS_API_TOKEN?.trim();
  if (!token) {
    throw new Error("DATOCMS_API_TOKEN is not configured");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Cache-Tags": "true",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`DatoCMS request failed: ${response.status}`);
  }

  const json = (await response.json()) as {
    data?: T;
    errors?: Array<{ extensions?: { code?: string }; message?: string }>;
  };

  if (json.errors?.length) {
    const error = new Error("DatoCMS GraphQL error");
    (error as { response?: unknown }).response = { errors: json.errors };
    if (process.env.NODE_ENV === "development") {
      console.error(
        "DatoCMS GraphQL error:",
        JSON.stringify(json.errors, null, 2),
      );
    }
    throw error;
  }

  return json.data as T;
}

export async function getAllArticles(): Promise<DatoArticleRecord[]> {
  const query = gql`
    ${articleFields}
    query AllArticles {
      allArticles(orderBy: _updatedAt_DESC) {
        ...ArticleFields
      }
    }
  `;

  const data = await datoRequest<{
    allArticles: DatoArticleRecord[];
  }>(query);

  return data.allArticles;
}

export async function getArticlesPage(options: {
  first: number;
  skip: number;
}): Promise<{ articles: DatoArticleRecord[]; totalCount: number }> {
  const query = gql`
    ${articleFields}
    query ArticlesPage($first: IntType!, $skip: IntType!) {
      allArticles(
        first: $first
        skip: $skip
        orderBy: _updatedAt_DESC
      ) {
        ...ArticleFields
      }
      _allArticlesMeta {
        count
      }
    }
  `;

  const data = await datoRequest<{
    allArticles: DatoArticleRecord[];
    _allArticlesMeta: { count: number };
  }>(query, { first: options.first, skip: options.skip });

  return {
    articles: data.allArticles,
    totalCount: data._allArticlesMeta.count,
  };
}

export async function getArticleBySlug(
  slug: string,
): Promise<DatoArticleRecord | null> {
  const query = gql`
    ${articleFields}
    query Article($slug: String!) {
      article(filter: { slug: { eq: $slug } }) {
        ...ArticleFields
      }
    }
  `;

  const data = await datoRequest<{
    article: DatoArticleRecord | null;
  }>(query, { slug });

  return data.article;
}

export type DatoShopRecord = {
  title: string;
  slug: string;
  address: string | null;
  openingHours: string | null;
  miscInformation: DatoStructuredTextValue | null;
  coverImage: { responsiveImage: DatoResponsiveImage | null } | null;
  galleryImages: Array<{ responsiveImage: DatoResponsiveImage | null }>;
};

/** Raw field API keys from DatoCMS (lowercase). */
type DatoShopRecordRaw = {
  title: string;
  slug: string;
  address: string | null;
  openinghours: string | null;
  miscinformation: { value: DatoStructuredTextValue } | null;
  coverimage: { responsiveImage: DatoResponsiveImage | null } | null;
  galleryimages: Array<{ responsiveImage: DatoResponsiveImage | null }>;
};

function normalizeShop(raw: DatoShopRecordRaw): DatoShopRecord {
  return {
    title: raw.title,
    slug: raw.slug,
    address: raw.address,
    openingHours: raw.openinghours,
    miscInformation: raw.miscinformation?.value ?? null,
    coverImage: raw.coverimage,
    galleryImages: raw.galleryimages ?? [],
  };
}

const shopFields = gql`
  fragment ShopFields on ShopRecord {
    title
    slug
    address
    openinghours
    miscinformation {
      value
    }
    coverimage {
      responsiveImage {
        src
        width
        height
        srcSet
        webpSrcSet
      }
    }
    galleryimages {
      responsiveImage {
        src
        width
        height
        srcSet
        webpSrcSet
      }
    }
  }
`;

export async function getAllShops(): Promise<DatoShopRecord[]> {
  const query = gql`
    ${shopFields}
    query Shops {
      allShops {
        ...ShopFields
      }
    }
  `;

  const data = await datoRequest<{
    allShops: DatoShopRecordRaw[];
  }>(query);

  return data.allShops.map(normalizeShop);
}

export async function getShopBySlug(
  slug: string,
): Promise<DatoShopRecord | null> {
  const query = gql`
    ${shopFields}
    query Shop($slug: String!) {
      shop(filter: { slug: { eq: $slug } }) {
        ...ShopFields
      }
    }
  `;

  const data = await datoRequest<{
    shop: DatoShopRecordRaw | null;
  }>(query, { slug });

  return data.shop ? normalizeShop(data.shop) : null;
}
