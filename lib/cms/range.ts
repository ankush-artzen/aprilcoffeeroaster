import { gql } from "graphql-request";
import {
  cacheLife,
  cacheTag,
} from "next/cache";
import {
  datoRequest,
  datoCacheTag,
  isDatoCmsConfigured,
  type DatoResponsiveImage,
  type DatoStructuredTextValue,
} from "lib/cms/datocms";

export { isDatoCmsConfigured };

export type DatoSeoField = {
  title: string | null;
  description: string | null;
  image: { url: string } | null;
};

export type DatoRangeProductRecord = {
  title: string;
  slug: string;
  description: DatoStructuredTextValue | null;
  thumbnail: { responsiveImage: DatoResponsiveImage | null } | null;
  images: Array<{ responsiveImage: DatoResponsiveImage | null }>;
};

export type DatoRangeRecord = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  description: DatoStructuredTextValue | null;
  heroImage: { responsiveImage: DatoResponsiveImage | null } | null;
  mobileHeroImage: { responsiveImage: DatoResponsiveImage | null } | null;
  heroVideo: { url: string; mimeType: string | null } | null;
  seo: DatoSeoField | null;
  products: DatoRangeProductRecord[];
};

type DatoRangeProductRecordRaw = {
  title: string;
  slug: string;
  description: { value: DatoStructuredTextValue } | null;
  thumbnail: { responsiveImage: DatoResponsiveImage | null } | null;
  images: Array<{ responsiveImage: DatoResponsiveImage | null }>;
  range?: { id: string } | null;
};

type DatoRangeRecordRaw = {
  id: string;
  title: string;
  slug: string;
  shortdescription: string | null;
  herotitle: string | null;
  herosubtitle: string | null;
  description: { value: DatoStructuredTextValue } | null;
  heroimage: { responsiveImage: DatoResponsiveImage | null } | null;
  mobileheroimage: { responsiveImage: DatoResponsiveImage | null } | null;
  herovideo: { url: string; mimeType: string | null } | null;
  seo: DatoSeoField | null;
};

const responsiveImageFields = gql`
  fragment ResponsiveImageFields on ResponsiveImage {
    src
    width
    height
    srcSet
    webpSrcSet
  }
`;

const rangeProductFields = gql`
  fragment RangeProductFields on ProductRecord {
    title
    slug
    description {
      value
    }
    thumbnail {
      responsiveImage(imgixParams: { fit: crop, w: 800, auto: format }) {
        ...ResponsiveImageFields
      }
    }
    images {
      responsiveImage(imgixParams: { fit: crop, w: 1024, auto: format }) {
        ...ResponsiveImageFields
      }
    }
    range {
      id
    }
  }
`;

const rangeFields = gql`
  ${responsiveImageFields}
  fragment RangeFields on RangeRecord {
    id
    title
    slug
    shortdescription
    herotitle
    herosubtitle
    description {
      value
    }
    heroimage {
      responsiveImage(imgixParams: { fit: crop, w: 1400 }) {
        ...ResponsiveImageFields
      }
    }
    mobileheroimage {
      responsiveImage(imgixParams: { fit: crop, w: 800 }) {
        ...ResponsiveImageFields
      }
    }
    herovideo {
      url
      mimeType
    }
    seo {
      title
      description
      image {
        url
      }
    }
  }
`;

function normalizeRangeProduct(
  raw: DatoRangeProductRecordRaw,
): DatoRangeProductRecord {
  return {
    title: raw.title,
    slug: raw.slug,
    description: raw.description?.value ?? null,
    thumbnail: raw.thumbnail,
    images: raw.images ?? [],
  };
}

function normalizeRange(
  raw: DatoRangeRecordRaw,
  products: DatoRangeProductRecord[] = [],
): DatoRangeRecord {
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    shortDescription: raw.shortdescription,
    heroTitle: raw.herotitle,
    heroSubtitle: raw.herosubtitle,
    description: raw.description?.value ?? null,
    heroImage: raw.heroimage,
    mobileHeroImage: raw.mobileheroimage,
    heroVideo: raw.herovideo,
    seo: raw.seo,
    products,
  };
}

async function getProductsForRange(
  rangeId: string,
): Promise<DatoRangeProductRecord[]> {
  const query = gql`
    ${responsiveImageFields}
    ${rangeProductFields}
    query RangeProducts($rangeId: ItemId!) {
      allProducts(
        filter: { range: { eq: $rangeId } }
        orderBy: _firstPublishedAt_ASC
        first: 500
      ) {
        ...RangeProductFields
      }
    }
  `;

  const data = await datoRequest<{
    allProducts: DatoRangeProductRecordRaw[];
  }>(query, { rangeId });

  return data.allProducts.map(normalizeRangeProduct);
}

async function getAllRangeProducts(): Promise<
  Map<string, DatoRangeProductRecord[]>
> {
  const query = gql`
    ${responsiveImageFields}
    ${rangeProductFields}
    query AllRangeProducts {
      allProducts(first: 500, orderBy: _firstPublishedAt_ASC) {
        ...RangeProductFields
      }
    }
  `;

  const data = await datoRequest<{
    allProducts: DatoRangeProductRecordRaw[];
  }>(query);

  const productsByRangeId = new Map<string, DatoRangeProductRecord[]>();

  for (const product of data.allProducts) {
    const rangeId = product.range?.id;
    if (!rangeId) continue;

    const normalized = normalizeRangeProduct(product);
    const existing = productsByRangeId.get(rangeId) ?? [];
    existing.push(normalized);
    productsByRangeId.set(rangeId, existing);
  }

  return productsByRangeId;
}

export async function getLatestRange(): Promise<DatoRangeRecord | null> {
  const query = gql`
    ${rangeFields}
    query LatestRange {
      allRanges(orderBy: _firstPublishedAt_DESC, first: 1) {
        ...RangeFields
      }
    }
  `;

  const data = await datoRequest<{
    allRanges: DatoRangeRecordRaw[];
  }>(query);

  const raw = data.allRanges[0];
  if (!raw) {
    return null;
  }

  const products = await getProductsForRange(raw.id);
  return normalizeRange(raw, products);
}

export async function getAllRanges(): Promise<DatoRangeRecord[]> {
  "use cache";
  cacheTag(datoCacheTag());
  cacheLife("days");

  const query = gql`
    ${rangeFields}
    query AllRanges {
      allRanges(orderBy: _firstPublishedAt_DESC) {
        ...RangeFields
      }
    }
  `;

  const [data, productsByRangeId] = await Promise.all([
    datoRequest<{
      allRanges: DatoRangeRecordRaw[];
    }>(query),
    getAllRangeProducts(),
  ]);

  return data.allRanges.map((range) =>
    normalizeRange(range, productsByRangeId.get(range.id) ?? []),
  );
}

export async function getRangeBySlug(
  slug: string,
): Promise<DatoRangeRecord | null> {
  "use cache";
  cacheTag(datoCacheTag(), `dato:range:${slug}`);
  cacheLife("days");

  const query = gql`
    ${rangeFields}
    query Range($slug: String!) {
      range(filter: { slug: { eq: $slug } }) {
        ...RangeFields
      }
    }
  `;

  const data = await datoRequest<{
    range: DatoRangeRecordRaw | null;
  }>(query, { slug });

  if (!data.range) {
    return null;
  }

  const products = await getProductsForRange(data.range.id);
  return normalizeRange(data.range, products);
}
