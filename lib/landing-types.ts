import type { DatoResponsiveImage } from "lib/cms/datocms";

export type LandingLink = {
  label: string;
  href: string;
  external: boolean;
};

export type LandingFeaturedContent = {
  title: string;
  description: string | null;
  href: string;
  image: DatoResponsiveImage | null;
};

/** Tri-ferg landing nav item (desktop home). */
export type LandingTriFergNavItem = {
  title: string;
  href: string;
  external?: boolean;
  fillClass: string;
  ariaLabel: string;
};

export type LandingPageData = {
  featured: LandingFeaturedContent | null;
  headerLinks: LandingLink[];
  footerLinks: LandingLink[];
  triFergNav: LandingTriFergNavItem[];
};
