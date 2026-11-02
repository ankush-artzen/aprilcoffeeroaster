import { CoffeeInfoFarmPage } from "components/coffee-info/coffee-info-farm-page";
import {
    getCoffeeInfoFarmBySlug,
    getCoffeeInfoFarmSlugs,
    isDatoCmsConfigured,
} from "lib/cms/coffee-info";
import { FALLBACK_STATIC_PARAMS } from "lib/constants";
import { getLandingPageData } from "lib/get-landing-page";
import { notFound } from "next/navigation";
import { connection } from "next/server";

export async function generateStaticParams() {
  if (!isDatoCmsConfigured()) {
    return FALLBACK_STATIC_PARAMS;
  }

  try {
    const slugs = await getCoffeeInfoFarmSlugs();
    if (slugs.length === 0) {
      return FALLBACK_STATIC_PARAMS;
    }
    return slugs.map((slug) => ({ slug }));
  } catch {
    return FALLBACK_STATIC_PARAMS;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug === FALLBACK_STATIC_PARAMS[0]?.slug) {
    return { title: "Coffee Info" };
  }

  const farm = await getCoffeeInfoFarmBySlug(slug);

  if (!farm) {
    return { title: "Coffee Info" };
  }

  return {
    title: farm.title.replace(/\s*–\s*$/, ""),
    description: farm.description.split("\n\n")[0] || undefined,
  };
}

export default async function CoffeeInfoFarmDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();

  const { slug } = await params;

  if (slug === FALLBACK_STATIC_PARAMS[0]?.slug) {
    notFound();
  }

  const [farm, { headerLinks, footerLinks }] = await Promise.all([
    getCoffeeInfoFarmBySlug(slug),
    getLandingPageData(),
  ]);

  if (!farm) {
    notFound();
  }

  return (
    <CoffeeInfoFarmPage
      farm={farm}
      headerLinks={headerLinks}
      footerLinks={footerLinks}
    />
  );
}
