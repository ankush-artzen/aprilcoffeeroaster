import type { DatoResponsiveImage, DatoShopRecord } from "lib/cms/datocms";

export type ShopGalleryImage = {
  src: string;
  srcSet?: string;
  width?: number;
  height?: number;
};

export type LocationCard = {
  title: string;
  image: string | null;
  link: string;
};

/** Default Locations grid order: Roastery → April Store → SP → Partners. */
const LOCATION_CARD_ORDER = [
  (shop: DatoShopRecord) =>
    /roastery/i.test(shop.slug) || /roastery/i.test(shop.title),

  (shop: DatoShopRecord) =>
    /experience|showroom|april-showroom|april-store|\bstore\b/i.test(
      shop.slug,
    ) ||
    /experience|showroom|\bstore\b/i.test(shop.title),

  (shop: DatoShopRecord) =>
    /^(sp)([-_]|$)|spcoffee|sp-coffee/i.test(shop.slug) ||
    /^sp\b/i.test(shop.title),

  (shop: DatoShopRecord) =>
    /partners?/i.test(shop.slug) || /partners?/i.test(shop.title),
];

function locationOrderIndex(shop: DatoShopRecord): number {
  const index = LOCATION_CARD_ORDER.findIndex((test) => test(shop));
  return index === -1 ? LOCATION_CARD_ORDER.length : index;
}

export function toLocationCards(
  shops: DatoShopRecord[],
): LocationCard[] {
  return [...shops]
    .sort((a, b) => locationOrderIndex(a) - locationOrderIndex(b))
    .map((shop) => ({
      title: shop.title,
      image: shopCoverSrc(shop),
      link:
        shop.slug === "partners"
          ? "/partners"
          : `/shops/${shop.slug}`,
    }));
}



/** Map CMS shops to Locations cards with fixed order and Partners → /partners. */


function responsiveToSlide(
  responsive: DatoResponsiveImage | null | undefined,
): ShopGalleryImage | null {
  if (!responsive?.src) return null;
  return {
    src: responsive.src,
    srcSet: responsive.srcSet,
    width: responsive.width,
    height: responsive.height,
  };
}

/** Cover image first, then gallery (no duplicates). */
export function shopGallerySlides(shop: DatoShopRecord): ShopGalleryImage[] {
  const slides: ShopGalleryImage[] = [];
  const seen = new Set<string>();

  const add = (slide: ShopGalleryImage | null) => {
    if (!slide || seen.has(slide.src)) return;
    seen.add(slide.src);
    slides.push(slide);
  };

  add(responsiveToSlide(shop.coverImage?.responsiveImage));
  for (const item of shop.galleryImages) {
    add(responsiveToSlide(item.responsiveImage));
  }

  return slides;
}

export function shopCoverSrc(shop: DatoShopRecord): string | null {
  const cover = shop.coverImage?.responsiveImage?.src;
  if (cover) return cover;

  for (const item of shop.galleryImages) {
    const src = item.responsiveImage?.src;
    if (src) return src;
  }

  return null;
}

export function parseShopAddress(address: string | null): string[] {
  if (!address?.trim()) return [];
  return address
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
