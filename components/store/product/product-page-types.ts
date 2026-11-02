import type { Product } from "lib/shopify/types";
import type {
  ParsedRecipeContent,
  ParsedSizeChart,
  ParsedTechnicalDetails,
} from "lib/store/parse-product-metafields";

export type ProductPageImage = {
  src: string;
  thumbSrc: string;
  zoom: string;
  label: string;
};

export type ProductPageVariant = {
  id: string;
  label: string;
  price: string;
  priceAmount: string;
};

export type ProductPageRelated = {
  handle: string;
  alt: string;
  image: string;
  active: boolean;
};

export type ProductPageClientProps = {
  product: Product;
  productId: string;
  handle: string;
  title: string;
  descriptionLines: string[];
  technicalDetails: ParsedTechnicalDetails | null;
  sizeChart: ParsedSizeChart | null;
  recommendations: ParsedRecipeContent | null;
  supplierInformation: ParsedRecipeContent | null;
  images: ProductPageImage[];
  variants: ProductPageVariant[];
  relatedProducts: ProductPageRelated[];
  /** When set, product links use `/range/[slug]/product/[handle]`. */
  rangeSlug?: string;
};
