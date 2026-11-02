"use client";

import type {
  PartnerListItem,
  PartnersFeedMetadata,
} from "lib/cms/partners";
import { useEffect, useState } from "react";
import { PartnerCard } from "./partner-card";

function splitIntoColumns(items: PartnerListItem[]) {
  const columns: PartnerListItem[][] = [[], [], []];

  items.forEach((item, index) => {
    columns[index % 3]!.push(item);
  });

  return columns;
}

function appendToColumns(
  columns: PartnerListItem[][],
  newItems: PartnerListItem[],
  startIndex: number,
) {
  const next = columns.map((column) => [...column]);

  newItems.forEach((item, index) => {
    next[(startIndex + index) % 3]!.push(item);
  });

  return next;
}

export function PartnersFeed({
  initialPartners,
  initialMetadata,
}: {
  initialPartners: PartnerListItem[];
  initialMetadata: PartnersFeedMetadata;
}) {
  const [partners, setPartners] = useState(initialPartners);
  const [metadata, setMetadata] = useState(initialMetadata);
  const [columns, setColumns] = useState(() =>
    splitIntoColumns(initialPartners),
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPartners(initialPartners);
    setMetadata(initialMetadata);
    setColumns(splitIntoColumns(initialPartners));
  }, [initialPartners, initialMetadata]);

  const hasMore = metadata.hasNextPage;

  async function loadMore() {
    if (!metadata.endCursor || loading) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({ cursor: metadata.endCursor });
      const res = await fetch(`/api/partners?${params}`);
      if (!res.ok) return;

      const data = (await res.json()) as {
        partners: PartnerListItem[];
        partnersMetadata: PartnersFeedMetadata;
      };

      const seen = new Set(partners.map((item) => item.id));
      const nextItems = data.partners.filter((item) => !seen.has(item.id));

      setPartners((prev) => [...prev, ...nextItems]);
      setColumns((prev) => appendToColumns(prev, nextItems, partners.length));
      setMetadata(data.partnersMetadata);
    } finally {
      setLoading(false);
    }
  }

  if (partners.length === 0) {
    return (
      <p className="w-full py-16 text-center text-sm font-bold uppercase tracking-tight">
        No partners available.
      </p>
    );
  }

  return (
    <>
      {/* Mobile: single-column feed (country A–Z order) */}
      <div
        aria-label="partners-view"
        className="flex w-full min-w-0 flex-col md:hidden"
      >
        {partners.map((partner) => (
          <PartnerCard
            key={partner.id}
            title={partner.title}
            href={partner.href}
            address={partner.address}
            image={partner.image}
            layout="mobile"
          />
        ))}
      </div>

      {/* md+: Projects-style 3-column masonry (country A–Z order) */}
      <div aria-label="partners-view" className="hidden w-full min-w-0 md:flex">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="min-w-0 flex-1 basis-0 pl-0">
            {column.map((partner) => (
              <PartnerCard
                key={partner.id}
                title={partner.title}
                href={partner.href}
                address={partner.address}
                image={partner.image}
                layout="desktop"
              />
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
