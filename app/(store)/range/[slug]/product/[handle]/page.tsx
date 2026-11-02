import Footer from "components/store/layout/footer";
import Header from "components/store/layout/header";
import RangeProductPageClient from "components/store/range/range-product-page-client";
import { getRangeBySlug, isDatoCmsConfigured } from "lib/cms/range";
import { getLandingPageData } from "lib/get-landing-page";
import { getProduct } from "lib/shopify";
import { mapRangeProductPageData } from "lib/store/map-range-product-page-data";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata(props: {
  params: Promise<{ slug: string; handle: string }>;
}): Promise<Metadata> {
  const { slug, handle } = await props.params;

  if (!isDatoCmsConfigured()) {
    return { title: "Product" };
  }

  try {
    const range = await getRangeBySlug(slug);
    const cmsProduct = range?.products.find((product) => product.slug === handle);

    if (!cmsProduct) {
      return { title: "Product" };
    }

    const shopifyProduct = await getProduct(cmsProduct.slug);
    const title = cmsProduct.title || shopifyProduct?.title || "Product";
    const description =
      shopifyProduct?.seo?.description || shopifyProduct?.description;

    return {
      title,
      description: description || undefined,
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function RangeProductPage(props: {
  params: Promise<{ slug: string; handle: string }>;
}) {
  const { slug, handle } = await props.params;

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

  const cmsProduct = range.products.find((product) => product.slug === handle);
  if (!cmsProduct) {
    notFound();
  }

  const shopifyProduct = await getProduct(cmsProduct.slug);

  const pageData = mapRangeProductPageData({
    cmsProduct,
    shopifyProduct,
    rangeSlug: slug,
  });

  return (
    <div className="flex min-h-dvh flex-col bg-white text-black">
      <Header navItems={headerLinks} />
      <RangeProductPageClient {...pageData} />
      <Footer links={footerLinks} />
    </div>
  );
}
