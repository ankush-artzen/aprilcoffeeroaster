import {
  areCollectionFiltersEqual,
  collectionFiltersFromSearchParams,
  searchParamsFromCollectionFilters,
  type CollectionFilters,
} from "lib/store/collection-filters";

export const PAGINATION_DIRECTION_PARAM = "direction";
export const PAGINATION_CURSOR_PARAM = "cursor";
export const PAGINATION_DIRECTION_NEXT = "next";

type SearchParamsReader = Pick<
  URLSearchParams,
  "get" | "getAll" | "toString"
>;

export function paginationCursorFromSearchParams(
  searchParams: SearchParamsReader,
): string | null {
  const direction = searchParams.get(PAGINATION_DIRECTION_PARAM);
  const cursor = searchParams.get(PAGINATION_CURSOR_PARAM);

  if (direction !== PAGINATION_DIRECTION_NEXT || !cursor) {
    return null;
  }

  return cursor;
}

export function searchParamsFromCollectionState({
  filters,
  paginationCursor,
}: {
  filters: CollectionFilters;
  paginationCursor: string | null;
}): URLSearchParams {
  const params = searchParamsFromCollectionFilters(filters);

  if (paginationCursor) {
    params.set(PAGINATION_DIRECTION_PARAM, PAGINATION_DIRECTION_NEXT);
    params.set(PAGINATION_CURSOR_PARAM, paginationCursor);
  }

  return params;
}

export function decodePaginationCursor(cursor: string | null): unknown {
  if (!cursor) {
    return null;
  }

  try {
    return JSON.parse(atob(cursor));
  } catch {
    return cursor;
  }
}

export function areCollectionUrlParamsEqual(
  searchParams: SearchParamsReader,
  filters: CollectionFilters,
  paginationCursor: string | null,
): boolean {
  const fromUrlFilters = collectionFiltersFromSearchParams(searchParams);
  const fromUrlCursor = paginationCursorFromSearchParams(searchParams);

  return (
    areCollectionFiltersEqual(filters, fromUrlFilters) &&
    paginationCursor === fromUrlCursor
  );
}
