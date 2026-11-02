"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const FARMS_PER_PAGE = 20;

export type CoffeeInfoFarmListItem = {
  slug: string;
  title: string;
};

export function CoffeeInfoFarmsList({
  farms,
}: {
  farms: CoffeeInfoFarmListItem[];
}) {
  const totalPages = Math.max(1, Math.ceil(farms.length / FARMS_PER_PAGE));
  const [page, setPage] = useState(1);

  const pagedFarms = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * FARMS_PER_PAGE;
    return farms.slice(start, start + FARMS_PER_PAGE);
  }, [farms, page, totalPages]);

  if (farms.length === 0) {
    return (
      <p className="type-text py-6 text-[13px] uppercase leading-[18px]">
        No data
      </p>
    );
  }

  const safePage = Math.min(page, totalPages);
  const showPagination = farms.length > FARMS_PER_PAGE;

  return (
    <div>
      <ul>
        {pagedFarms.map((farm) => (
          <li key={farm.slug} className="border-b border-[#d7d7d7]">
            <Link
              href={`/coffee-inf-recipes/${farm.slug}`}
              className="type-text flex w-full items-start gap-3 py-3.5 text-left text-[13px] uppercase leading-[18px] outline outline-[2pt] outline-transparent outline-offset-2 transition duration-150 ease-in-out hover:outline-hover-frame active:text-active"
            >
              <svg
                aria-hidden
                viewBox="0 0 320 512"
                className="mt-0.5 h-3.5 w-3.5 shrink-0 fill-current"
              >
                <path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z" />
              </svg>
              <span>{farm.title}</span>
            </Link>
          </li>
        ))}
      </ul>

      {showPagination ? (
        <nav
          aria-label="Farm list pagination"
          className="mt-6 flex items-center justify-between gap-4"
        >
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={safePage <= 1}
            className="type-text text-[12px] uppercase leading-[16px] underline underline-offset-2 outline outline-[2pt] outline-transparent outline-offset-2 transition duration-150 ease-in-out hover:outline-hover-frame disabled:cursor-not-allowed disabled:no-underline disabled:opacity-40 disabled:hover:outline-transparent"
          >
            Previous
          </button>
          <p className="type-text text-[12px] uppercase leading-[16px]">
            Page {safePage} of {totalPages}
          </p>
          <button
            type="button"
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            disabled={safePage >= totalPages}
            className="type-text text-[12px] uppercase leading-[16px] underline underline-offset-2 outline outline-[2pt] outline-transparent outline-offset-2 transition duration-150 ease-in-out hover:outline-hover-frame disabled:cursor-not-allowed disabled:no-underline disabled:opacity-40 disabled:hover:outline-transparent"
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  );
}
