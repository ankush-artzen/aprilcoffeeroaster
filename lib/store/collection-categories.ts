export const collectionCategories = [
  { label: "New", handle: "new" },
  { label: "Everything", handle: "everything" },
  { label: "Filter Coffee", handle: "filter-coffee" },
  { label: "Espresso Coffee", handle: "espresso-coffee" },
  { label: "Limited Coffee", handle: "limited-coffee" },
  { label: "Organic Coffee", handle: "organic-coffee" },
  { label: "Coffee Subscriptions", handle: "coffee-subscriptions" },
  { label: "Sample Box", handle: "samplebox" },
  { label: "Filter Drip Packs", handle: "filter-drip-packs" },
  { label: "Brewers", handle: "brewers" },
  { label: "Paper Filter", handle: "paper-filter" },
  { label: "Cups & Mugs", handle: "cupsandmugs" },
  { label: "Thermos", handle: "thermos" },
  { label: "Accessories", handle: "accessories" },
  { label: "Bundles", handle: "bundles" },
  { label: "Clothing", handle: "clothing" },
  { label: "Projects", handle: "projects" },
  { label: "Tasting Menu", handle: "tasting-menu" }
] as const;

export type CollectionCategoryHandle =
  (typeof collectionCategories)[number]["handle"];
