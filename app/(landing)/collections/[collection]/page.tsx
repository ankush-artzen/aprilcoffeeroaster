import CollectionPageLayout from "components/store/collections/collection-page-layout";
import { loadCollectionProductsPage } from "lib/shopify";
import { collectionCategories } from "lib/store/collection-categories";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return collectionCategories.map((category) => ({
    collection: category.handle,
  }));
}

export default async function Page(props: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await props.params;
  const isKnown = collectionCategories.some(
    (category) => category.handle === collection,
  );

  if (!isKnown) {
    notFound();
  }

  const { products, pageInfo } = await loadCollectionProductsPage({
    collection,
  });

  return (
    <CollectionPageLayout
      collection={collection}
      products={products}
      pageInfo={pageInfo}
    />
  );
}
