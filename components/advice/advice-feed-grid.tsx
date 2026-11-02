"use client";

import type { AdviceFeedItem, AdviceFeedMetadata } from "lib/advice/advice-types";
import { useEffect, useState } from "react";
import { AdviceCard, type AdviceCardProps } from "./advice-card";

function splitIntoColumns(items: AdviceCardProps[]) {
  const columns: AdviceCardProps[][] = [[], [], []];

  items.forEach((item, index) => {
    columns[index % 3]!.push(item);
  });

  return columns;
}

function appendToColumns(
  columns: AdviceCardProps[][],
  newItems: AdviceCardProps[],
  startIndex: number,
) {
  const next = columns.map((column) => [...column]);

  newItems.forEach((item, index) => {
    next[(startIndex + index) % 3]!.push(item);
  });

  return next;
}

function toCardProps(item: AdviceFeedItem): AdviceCardProps {
  return {
    title: item.title,
    href: item.path,
    image: item.image,
    srcSet: item.srcSet,
    width: item.width,
    height: item.height,
  };
}

export function AdviceFeedGrid({
  initialFeed,
  initialMetadata,
}: {
  initialFeed: AdviceFeedItem[];
  initialMetadata: AdviceFeedMetadata;
}) {
  const [items, setItems] = useState(initialFeed);
  const [metadata, setMetadata] = useState(initialMetadata);
  const [columns, setColumns] = useState(() =>
    splitIntoColumns(initialFeed.map(toCardProps)),
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItems(initialFeed);
    setMetadata(initialMetadata);
    setColumns(splitIntoColumns(initialFeed.map(toCardProps)));
  }, [initialFeed, initialMetadata]);

  const cardProps = items.map(toCardProps);
  const hasMore = metadata.hasNextPage;

  async function loadMore() {
    if (!metadata.endCursor || loading) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({ cursor: metadata.endCursor });
      const res = await fetch(`/api/projects?${params}`);
      if (!res.ok) return;

      const data = (await res.json()) as {
        adviceFeed: AdviceFeedItem[];
        adviceFeedMetadata: AdviceFeedMetadata;
      };

      const seen = new Set(items.map((item) => item.id));
      const nextItems = data.adviceFeed.filter((item) => !seen.has(item.id));
      const nextCardProps = nextItems.map(toCardProps);

      setItems((prev) => [...prev, ...nextItems]);
      setColumns((prev) => appendToColumns(prev, nextCardProps, items.length));
      setMetadata(data.adviceFeedMetadata);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Mobile: single-column feed */}
      <div
        aria-label="advice-view"
        className="flex w-full min-w-0 flex-col md:hidden"
      >
        {cardProps.map((item) => (
          <AdviceCard key={item.href} {...item} layout="mobile" />
        ))}
      </div>

      {/* md+: 3-column masonry */}
      <div
        aria-label="advice-view"
        className="hidden w-full min-w-0 md:flex"
      >
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="min-w-0 flex-1 basis-0 pl-0">
            {column.map((item) => (
              <AdviceCard key={item.href} {...item} layout="desktop" />
            ))}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={loadMore}
        disabled={!hasMore || loading}
        className={`w-full cursor-pointer text-center text-sm font-bold uppercase hover:underline disabled:cursor-not-allowed disabled:invisible disabled:hidden ${
          hasMore ? "" : "invisible"
        }`}
      >
        {loading ? "Loading…" : "Load More"}
      </button>
    </>
  );
}
