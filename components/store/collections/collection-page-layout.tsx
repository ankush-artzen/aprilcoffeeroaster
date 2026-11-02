import CollectionPageClient from "components/store/collections/collection-page-client";
import type { PageInfo, Product } from "lib/shopify/types";
import { Suspense } from "react";

export default function CollectionPageLayout({
  collection,
  products,
  pageInfo,
}: {
  collection: string;
  products: Product[];
  pageInfo: PageInfo;
}) {
  return (
    <Suspense fallback={null}>
      <CollectionPageClient
        collection={collection}
        initialProducts={products}
        initialPageInfo={pageInfo}
      />
    </Suspense>
  );
}
