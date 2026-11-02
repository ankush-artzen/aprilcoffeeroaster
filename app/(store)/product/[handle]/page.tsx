import ProductPageClient from "components/store/product/product-page-client";
import { getProduct, getProductRecommendations } from "lib/shopify";
import { mapProductPageData } from "lib/store/map-product-page-data";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata(props: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await props.params;
  const product = await getProduct(handle);

  if (!product) {
    return { title: "Product" };
  }

  return {
    title: product.seo?.title || product.title,
    description: product.seo?.description || product.description,
  };
}

export default async function Page(props: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await props.params;
  const product = await getProduct(handle);

  if (!product) {
    notFound();
  }

  const recommendations = await getProductRecommendations(product.id);
  const pageData = mapProductPageData(product, recommendations);

  return <ProductPageClient {...pageData} />;
}
