import Footer from "components/store/layout/footer";
import Header from "components/store/layout/header";
import RangePage from "components/store/range/range-page";
import { getAllRanges, getRangeBySlug, isDatoCmsConfigured } from "lib/cms/range";
import { FALLBACK_STATIC_PARAMS } from "lib/constants";
import { getLandingPageData } from "lib/get-landing-page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  if (!isDatoCmsConfigured()) {
    return FALLBACK_STATIC_PARAMS;
  }

  try {
    const ranges = await getAllRanges();
    if (ranges.length === 0) {
      return FALLBACK_STATIC_PARAMS;
    }
    return ranges.map((range) => ({ slug: range.slug }));
  } catch {
    return FALLBACK_STATIC_PARAMS;
  }
}

export async function generateMetadata(props: { 
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;

  if (!isDatoCmsConfigured()) {
    return { title: "Range" };
  }

  try {
    const range = await getRangeBySlug(slug);
    if (!range) {
      return { title: "Range" };
    }

    return {
      title: range.seo?.title ?? range.title,
      description: range.seo?.description ?? range.shortDescription ?? undefined,
    };
  } catch {
    return { title: "Range" };
  }
}

export default async function RangeDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  if (!isDatoCmsConfigured()) {
    notFound();
  }

  const [range, { headerLinks, footerLinks }] = await Promise.all([
    getRangeBySlug(slug),
    getLandingPageData(),
  ]);

  if (!range) {
    notFound();
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white text-black">
      <Header navItems={headerLinks} />
      <RangePage range={range} />
      <Footer links={footerLinks} />
    </div>
  );
}
