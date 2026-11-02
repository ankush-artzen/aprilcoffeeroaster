import type {
    ProductPageClientProps,
    ProductPageImage,
    ProductPageRelated,
    ProductPageVariant,
} from "components/store/product/product-page-types";
import { DEFAULT_OPTION } from "lib/constants";
import { shopifyImageUrl } from "lib/shopify-image-url";
import type { Product, ProductVariant } from "lib/shopify/types";
import { parseProductDescriptionLines } from "lib/store/parse-product-description";
import {
    parseRecipeContent,
    parseSizeChart,
    parseTechnicalDetails,
} from "lib/store/parse-product-metafields";

/** Collections that may show the product `recommendations` metafield. */
const RECOMMENDATIONS_COLLECTION_HANDLES = new Set([
  "filter-coffee",
  "limited-coffee",
]);

function formatVariantPrice(variant: ProductVariant): string {
  const { amount, currencyCode } = variant.price;

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(amount));
}

function mapProductImages(
  product: Product,
  handle: string,
): ProductPageImage[] {
  const sources =
    product.images.length > 0
      ? product.images
      : product.featuredImage.url
        ? [product.featuredImage]
        : [];

  return sources.map((image, index) => ({
    src: shopifyImageUrl(image.url, 700),
    thumbSrc: shopifyImageUrl(image.url, 90),
    zoom: image.url.split("?")[0] ?? image.url,
    label: `${handle}-image-${index}`,
  }));
}

function productAllowsRecommendations(product: Product): boolean {
  return product.collections.some((collection) =>
    RECOMMENDATIONS_COLLECTION_HANDLES.has(collection.handle),
  );
}

export function mapProductPageData(
  product: Product,
  relatedRecommendationProducts: Product[],
): ProductPageClientProps {
  const images = mapProductImages(product, product.handle);

  const variants: ProductPageVariant[] = product.variants.map((variant) => ({
    id: variant.id,
    label: variant.title === DEFAULT_OPTION ? "" : variant.title,
    price: formatVariantPrice(variant),
    priceAmount: variant.price.amount,
  }));

  const relatedProducts: ProductPageRelated[] = relatedRecommendationProducts
    .filter((item) => item.featuredImage?.url)
    .slice(0, 4)
    .map((item) => ({
      handle: item.handle,
      alt: item.title,
      image: shopifyImageUrl(item.featuredImage.url, 90),
      active: item.handle === product.handle,
    }));

  if (
    relatedProducts.length === 0 &&
    product.featuredImage?.url &&
    !relatedProducts.some((item) => item.handle === product.handle)
  ) {
    relatedProducts.push({
      handle: product.handle,
      alt: product.title,
      image: shopifyImageUrl(product.featuredImage.url, 90),
      active: true,
    });
  }

  const recommendations = productAllowsRecommendations(product)
    ? parseRecipeContent(product.recommendations?.value)
    : null;

  return {
    product,
    productId: product.id,
    handle: product.handle,
    title: product.title,
    descriptionLines: parseProductDescriptionLines(
      product.description,
      product.descriptionHtml,
    ),
    technicalDetails: parseTechnicalDetails(product.technicalDetails?.value),
    sizeChart: parseSizeChart(product.sizeChart?.value),
    recommendations,
    supplierInformation: parseRecipeContent(product.supplierInformation?.value),
    images,
    variants,
    relatedProducts,
  };
}
