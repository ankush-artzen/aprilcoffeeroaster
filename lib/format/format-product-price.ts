import type { Product } from "lib/shopify/types";

export function formatProductPrice(product: Product): string {
  if (!product.availableForSale) {
    return "Sold Out";
  }

  const { amount, currencyCode } = product.priceRange.minVariantPrice;

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(amount));
}
