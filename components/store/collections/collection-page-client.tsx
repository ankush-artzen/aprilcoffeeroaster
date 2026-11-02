"use client";

import CategoryNav from "components/store/collections/category-nav";
import CollectionFilterModal from "components/store/collections/collection-filter-modal";
import CollectionProductGrid from "components/store/collections/collection-product-grid";
import Logo from "components/store/logo/logo";
import type { PageInfo, Product } from "lib/shopify/types";
import {
  applyCollectionFilters,
  areCollectionFiltersEqual,
  collectionFiltersFromSearchParams,
  defaultCollectionFilters,
  type CollectionFilters,
} from "lib/store/collection-filters";
import {
  areCollectionUrlParamsEqual,
  decodePaginationCursor,
  paginationCursorFromSearchParams,
  searchParamsFromCollectionState,
} from "lib/store/collection-pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Footer from "../layout/footer";

export default function CollectionPageClient({
  collection,
  initialProducts,
  initialPageInfo,
}: {
  collection: string;
  initialProducts: Product[];
  initialPageInfo: PageInfo;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFiltersState] = useState<CollectionFilters>(() =>
    collectionFiltersFromSearchParams(searchParams),
  );
  const [paginationCursor, setPaginationCursor] = useState<string | null>(() =>
    paginationCursorFromSearchParams(searchParams),
  );
  const skipUrlSyncRef = useRef(false);

  useEffect(() => {
    const fromUrlFilters = collectionFiltersFromSearchParams(searchParams);
    const fromUrlCursor = paginationCursorFromSearchParams(searchParams);
    let changed = false;

    setFiltersState((current) => {
      if (areCollectionFiltersEqual(current, fromUrlFilters)) {
        return current;
      }
      changed = true;
      return fromUrlFilters;
    });

    setPaginationCursor((current) => {
      if (current === fromUrlCursor) {
        return current;
      }
      changed = true;
      return fromUrlCursor;
    });

    if (changed) {
      skipUrlSyncRef.current = true;
    }
  }, [searchParams]);

  useEffect(() => {
    if (skipUrlSyncRef.current) {
      skipUrlSyncRef.current = false;
      return;
    }

    if (
      areCollectionUrlParamsEqual(searchParams, filters, paginationCursor)
    ) {
      return;
    }

    const params = searchParamsFromCollectionState({
      filters,
      paginationCursor,
    });
    const query = params.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;

    if (collection === "all") {
      console.groupCollapsed("[collections/all] url updated");
      console.log({
        direction: paginationCursor ? "next" : null,
        cursor: decodePaginationCursor(paginationCursor),
        rawCursor: paginationCursor,
        url: nextUrl,
      });
      console.groupEnd();
    }

    router.replace(nextUrl, { scroll: false });
  }, [collection, filters, paginationCursor, pathname, router, searchParams]);

  const setFilters = useCallback(
    (
      updater:
        | CollectionFilters
        | ((current: CollectionFilters) => CollectionFilters),
    ) => {
      setFiltersState((current) =>
        typeof updater === "function" ? updater(current) : updater,
      );
      setPaginationCursor(null);
    },
    [],
  );

  const clearFilters = () => {
    setFilters(defaultCollectionFilters);
  };

  return (
    <>
      <Logo onMenuOpenChange={setMenuOpen} />
      <div className="mx-auto mt-0 min-h-0 w-full max-w-[1400px] overflow-hidden bg-white sm:mt-1 max-md:overflow-visible">
        <CategoryNav
          menuOpen={menuOpen}
          activeCollection={collection}
          onFilterClick={() => setFilterOpen(true)}
        />


{/* // h-[calc(100vh-130px)] */}

        <main
          role="main"
          id="mainContent"
          className="
  mt-5
  sm:mt-0
  min-h-0
  overflow-y-scroll
  w-[73%]
h-[calc(100vh-30px)]
  ease-out
  duration-300

  md:w-[75%]

  max-md:mt-0
  max-md:h-auto
  max-md:overflow-y-visible
  max-md:float-none
  max-md:w-full
  max-md:pr-0
  max-md:-translate-x-0
"
        >
          {initialProducts.length === 0 ? (
            <p className="py-10 text-center text-sm font-bold uppercase">
  This collection is currently empty. We’re working on bringing something new your way — please check back soon.
            </p>
          ) : (
            <>
              <div className="h-px w-full" />
              <CollectionProductGrid
                collection={collection}
                initialProducts={initialProducts}
                initialPageInfo={initialPageInfo}
                filters={filters}
                applyFilters={applyCollectionFilters}
                onFilterClick={() => setFilterOpen(true)}
                paginationCursor={paginationCursor}
                onPaginationChange={setPaginationCursor}
              />
            </>
          )}
        
          
        </main>
        <Footer />
      </div>

      <CollectionFilterModal
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        showSoldOut={filters.showSoldOut}
        onShowSoldOutChange={(showSoldOut) =>
          setFilters((current) => ({ ...current, showSoldOut }))
        }
        query={filters.query}
        onQueryChange={(query) =>
          setFilters((current) => ({ ...current, query }))
        }
        onClear={clearFilters}
      />
    </>
  );
}
