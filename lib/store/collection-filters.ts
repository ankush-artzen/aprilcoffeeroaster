import type { Product } from "lib/shopify/types";

export type CollectionFilters = {
  showSoldOut: boolean;
  sizes: string[];
  query: string;
};

export const defaultCollectionFilters: CollectionFilters = {
  showSoldOut: true,
  sizes: [],
  query: "",
};

const HIDE_SOLD_OUT_PARAM = "hideSoldOut";
const SIZE_PARAM = "size";
const QUERY_PARAM = "q";

type SearchParamsReader = Pick<URLSearchParams, "get" | "getAll">;

export function collectionFiltersFromSearchParams(
  searchParams: SearchParamsReader,
): CollectionFilters {
  const hideSoldOut =
    searchParams.get(HIDE_SOLD_OUT_PARAM) === "1" ||
    searchParams.get(HIDE_SOLD_OUT_PARAM) === "true";

  const validSizes = new Set<string>(filterSizeOptions);
  const sizes = searchParams
    .getAll(SIZE_PARAM)
    .filter((size): size is (typeof filterSizeOptions)[number] =>
      validSizes.has(size),
    );
  const query = searchParams.get(QUERY_PARAM)?.trim() ?? "";

  if (!hideSoldOut && sizes.length === 0 && !query) {
    return defaultCollectionFilters;
  }

  return {
    showSoldOut: !hideSoldOut,
    sizes,
    query,
  };
}

export function searchParamsFromCollectionFilters(
  filters: CollectionFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  if (!filters.showSoldOut) {
    params.set(HIDE_SOLD_OUT_PARAM, "1");
  }

  for (const size of filters.sizes) {
    params.append(SIZE_PARAM, size);
  }

  const query = filters.query.trim();
  if (query) {
    params.set(QUERY_PARAM, query);
  }

  return params;
}

export function areCollectionFiltersEqual(
  a: CollectionFilters,
  b: CollectionFilters,
): boolean {
  if (
    a.showSoldOut !== b.showSoldOut ||
    a.sizes.length !== b.sizes.length ||
    a.query.trim() !== b.query.trim()
  ) {
    return false;
  }

  return a.sizes.every((size, index) => size === b.sizes[index]);
}

export const filterSizeOptions = [
  "Small",
  "Large",
  "Kenya",
  "Ethiopia",
  "Costa Rica",
  "Organic",
] as const;

const SIZE_OPTION_NAMES = new Set(["size", "taille"]);

function productHasAvailableSize(product: Product, sizes: string[]) {
  return product.variants.some(
    (variant) =>
      variant.availableForSale &&
      variant.selectedOptions.some(
        (option) =>
          SIZE_OPTION_NAMES.has(option.name.toLowerCase()) &&
          sizes.includes(option.value),
      ),
  );
}

function isProductSoldOut(product: Product) {
  return (
    !product.availableForSale ||
    product.variants.every((variant) => !variant.availableForSale)
  );
}

function productMatchesQuery(product: Product, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  const haystack = [
    product.title,
    product.handle,
    product.description,
    ...product.tags,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(needle);
}

export function applyCollectionFilters(
  products: Product[],
  filters: CollectionFilters,
): Product[] {
  return products.filter((product) => {
    if (!filters.showSoldOut && isProductSoldOut(product)) {
      return false;
    }

    if (filters.sizes.length > 0 && !productHasAvailableSize(product, filters.sizes)) {
      return false;
    }

    if (!productMatchesQuery(product, filters.query)) {
      return false;
    }

    return true;
  });
}
