import type { AdviceFeedItem } from "lib/advice/advice-types";
import { getAdviceFeed } from "lib/advice/get-advice-feed";
import { getDatoLandingPageContent } from "lib/cms/landing";
import { getLatestRange, isDatoCmsConfigured } from "lib/cms/range";
import {
  socialLinks as defaultFooterLinks,
  defaultTriFergNav,
} from "lib/constants";
import type {
  LandingFeaturedContent,
  LandingLink,
  LandingPageData,
  LandingTriFergNavItem,
} from "lib/landing-types";
import { cache } from "react";

const LATEST_ADVICE_SLOT = 2;

const defaultHeaderLinks: LandingLink[] = [
  { label: "LOCATIONS", href: "/shops", external: false },
  { label: "WEBSHOP", href: "/collections/everything", external: false },
  { label: "PROJECTS", href: "/projects", external: false },
  { label: "COFFEE & INFO", href: "/coffee-inf-recipes", external: false },
  {
    label: "SP COFFEE",
    href: "https://sustainableprofilecoffee.com",
    external: true,
  },
];

function isValidFeatured(
  featured: LandingFeaturedContent | null,
): featured is LandingFeaturedContent {
  return Boolean(featured?.title?.trim() && featured?.href?.trim());
}

function feedItemToFeatured(item: AdviceFeedItem): LandingFeaturedContent {
  return {
    title: item.title,
    description: null,
    href: item.path,
    image: item.image
      ? {
          src: item.image,
          width: item.width,
          height: item.height,
          srcSet: item.srcSet ?? "",
          webpSrcSet: "",
        }
      : null,
  };
}

function injectFeaturedIntoTriFerg(
  items: LandingTriFergNavItem[],
  featured: LandingFeaturedContent,
): LandingTriFergNavItem[] {
  if (items.length === 0) return items;

  const slot =
    items.length > LATEST_ADVICE_SLOT ? LATEST_ADVICE_SLOT : items.length - 1;

  return items.map((item, index) =>
    index === slot
      ? {
          ...item,
          href: "/projects",
          external: false,
        }
      : item,
  );
}

function triFergFromHeaderLinks(
  headerLinks: LandingLink[],
): LandingTriFergNavItem[] {
  const pick = [
    headerLinks.find((l) => l.href === "/shops"),
    headerLinks.find((l) => l.href === "/collections/all"),
    headerLinks.find(
      (l) => l.href.startsWith("/projects/") && l.href !== "/projects",
    ),
    headerLinks.find((l) => l.href === "/coffee-inf-recipes"),
    headerLinks.find(
      (l) =>
        l.external &&
        (l.href.includes("sustainableprofilecoffee") ||
          l.href.includes("manorplace")),
    ),
  ].filter((item): item is LandingLink => Boolean(item));

  const source = pick.length >= 4 ? pick : headerLinks.slice(0, 5);

  return source.map((link, index) => ({
    title: link.label,
    href: link.href,
    external: link.external,
    fillClass: defaultTriFergNav[index]?.fillClass ?? "",
    ariaLabel:
      defaultTriFergNav[index]?.ariaLabel ??
      `${link.label.toLowerCase().replace(/\s+/g, "-")}-tri-ferg-link`,
  }));
}

async function getRangeHeaderLinks(): Promise<LandingLink[]> {
  if (!isDatoCmsConfigured()) {
    return [];
  }

  try {
    const range = await getLatestRange();
    if (!range) {
      return [];
    }

    return [
      {
        label: range.title,
        href: `/range/${range.slug}`,
        external: false,
      },
    ];
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to fetch ranges from DatoCMS:", error);
    }
    return [];
  }
}

function withRangeHeaderLinks(links: LandingLink[], rangeLinks: LandingLink[]) {
  if (rangeLinks.length === 0) {
    return links;
  }

  const withoutRanges = links.filter((link) => !link.href.startsWith("/range/"));
  return [...rangeLinks, ...withoutRanges];
}

async function loadLandingPageData(): Promise<LandingPageData> {
  const [cmsLanding, adviceFeed, rangeLinks] = await Promise.all([
    getDatoLandingPageContent(),
    getAdviceFeed(),
    getRangeHeaderLinks(),
  ]);

  const latestAdvice = adviceFeed.adviceFeed[0];
  const featured = latestAdvice
    ? feedItemToFeatured(latestAdvice)
    : (cmsLanding?.featured ?? null);

  const headerLinks = withRangeHeaderLinks(
    cmsLanding?.headerLinks.length ? cmsLanding.headerLinks : defaultHeaderLinks,
    rangeLinks,
  );

  const footerLinks =
    cmsLanding?.footerLinks.length ? cmsLanding.footerLinks : defaultFooterLinks;

  const triFergBase = cmsLanding?.headerLinks.length
    ? triFergFromHeaderLinks(headerLinks)
    : defaultTriFergNav;

  const triFergNav = isValidFeatured(featured)
    ? injectFeaturedIntoTriFerg(triFergBase, featured)
    : triFergBase;

  return {
    featured,
    headerLinks,
    footerLinks,
    triFergNav,
  };
}

export const getLandingPageData = cache(loadLandingPageData);
