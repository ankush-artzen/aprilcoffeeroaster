import CollectionPageLayout from "components/store/collections/collection-page-layout";
import { loadCollectionProductsPage } from "lib/shopify";

export default async function Page() {
  const { products, pageInfo } = await loadCollectionProductsPage({
    collection: "all",
  });

  return (
    <CollectionPageLayout
      collection="all"
      products={products}
      pageInfo={pageInfo}
    />
  );
}
