import type { DatoRangeProductRecord } from "lib/cms/range";
import { sanitizeRichHtml } from "lib/html/sanitize-rich-html";
import type { DatoResponsiveImage } from "lib/cms/datocms";
import { structuredTextToPlain } from "lib/cms/structured-text";
import type { Product, ProductVariant } from "lib/shopify/types";

export type RangeProductPageVariant = {
  id: string;
  label: string;
  price: string;
};

export type RangeProductPageData = {
  handle: string;
  rangeSlug: string;
  title: string;
  descriptionHtml: string;
  images: DatoResponsiveImage[];
  /** Present when the CMS slug matches a Shopify product handle. */
  product: Product | null;
  variants: RangeProductPageVariant[];
};

function formatVariantPrice(variant: ProductVariant): string {
  const { amount, currencyCode } = variant.price;

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(amount));
}

function collectGalleryImages(
  cmsProduct: DatoRangeProductRecord,
): DatoResponsiveImage[] {
  const sources: Array<DatoResponsiveImage | null | undefined> = [];

  if (cmsProduct.thumbnail?.responsiveImage) {
    sources.push(cmsProduct.thumbnail.responsiveImage);
  }

  for (const image of cmsProduct.images) {
    sources.push(image.responsiveImage);
  }

  const seen = new Set<string>();
  const images: DatoResponsiveImage[] = [];

  for (const image of sources) {
    if (!image?.src || seen.has(image.src)) continue;
    seen.add(image.src);
    images.push(image);
  }

  return images;
}

function descriptionToHtml(
  description: DatoRangeProductRecord["description"],
): string {
  const plain = structuredTextToPlain(description);
  if (!plain?.trim()) return "";

  return plain
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("<br>");
}

export function mapRangeProductPageData({
  cmsProduct,
  shopifyProduct,
  rangeSlug,
}: {
  cmsProduct: DatoRangeProductRecord;
  shopifyProduct: Product | null | undefined;
  rangeSlug: string;
}): RangeProductPageData {
  const cmsDescription = descriptionToHtml(cmsProduct.description);
  const shopifyDescription = shopifyProduct?.descriptionHtml
    ? shopifyProduct.descriptionHtml.replace(/<[^>]+>/g, " ").trim()
    : (shopifyProduct?.description?.trim() ?? "");

  const variants: RangeProductPageVariant[] = shopifyProduct
    ? shopifyProduct.variants.map((variant) => ({
        id: variant.id,
        label: variant.title,
        price: formatVariantPrice(variant),
      }))
    : [];

  return {
    handle: cmsProduct.slug,
    rangeSlug,
    title: (
      cmsProduct.title ||
      shopifyProduct?.title ||
      cmsProduct.slug
    ).toUpperCase(),
    descriptionHtml: sanitizeRichHtml(
      cmsDescription ||
        shopifyDescription
          .split(/\n+/)
          .map((line) => line.trim())
          .filter(Boolean)
          .join("<br>"),
    ),
    images: collectGalleryImages(cmsProduct),
    product: shopifyProduct ?? null,
    variants,
  };
}
