"use client";

import { CoffeeInfoPhotoLightbox } from "components/coffee-info/coffee-info-photo-lightbox";
import type { CoffeeInfoFarm } from "lib/coffee-info/content";
import { useMemo, useState, type ReactNode } from "react";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 320 512"
      className={`mt-0.5 h-3.5 w-3.5 shrink-0 fill-current transition-transform duration-200 ${
        open ? "rotate-90" : ""
      }`}
    >
      <path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z" />
    </svg>
  );
}

function AccordionItem({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-[#d7d7d7] [overflow-anchor:none]">
      <button
        type="button"
        aria-expanded={open}
        onMouseDown={(event) => {
          // Avoid focus scroll jump when toggling with the mouse
          event.preventDefault();
        }}
        onClick={onToggle}
        className="type-text flex w-full items-start gap-3 py-3.5 text-left text-[13px] uppercase leading-[18px] outline-none transition duration-150 ease-in-out active:text-active"
      >
        <ChevronIcon open={open} />
        <span>{label}</span>
      </button>
      {open ? <div className="pb-5 pl-7 pr-0 pt-2 sm:pr-1">{children}</div> : null}
    </div>
  );
}

function TextBlocks({ text }: { text: string }) {
  return (
    <div className="type-text space-y-3 text-[13px] leading-[18px]">
      {text.split(/\n\n+/).map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function RecipeBlock({ title, body }: { title: string; body?: string }) {
  if (!body?.trim()) return null;

  return (
    <div className="space-y-2">
      <p className="type-text text-[13px] font-medium uppercase leading-[18px]">
        {title}
      </p>
      <TextBlocks text={body} />
    </div>
  );
}

function PhotoGallery({ photos }: { photos: CoffeeInfoFarm["photos"] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div
        className="flex gap-2 overflow-x-auto overscroll-x-contain pb-2 pe-3 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]"
        role="list"
        aria-label={`${photos.length} photos`}
      >
        {photos.map((photo, index) => (
          <button
            key={`${index}-${photo.src}`}
            type="button"
            role="listitem"
            aria-label={`Open photo ${index + 1} of ${photos.length}`}
            className="relative h-36 w-24 shrink-0 cursor-zoom-in overflow-hidden bg-[#e9e9e9] sm:h-44 sm:w-28"
            onClick={() => setLightboxIndex(index)}
          >
            {/* External URLs from Dato image_url may be any host */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.alt || `Photo ${index + 1}`}
              className="absolute inset-0 h-full w-full object-cover"
              loading={index < 4 ? "eager" : "lazy"}
            />
          </button>
        ))}
        {/* Spacer so the last image can scroll fully into view */}
        <div aria-hidden className="w-1 shrink-0" />
      </div>

      {lightboxIndex !== null ? (
        <CoffeeInfoPhotoLightbox
          photos={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      ) : null}
    </>
  );
}

function coffeeHasContent(coffee: CoffeeInfoFarm["coffees"][number]) {
  return Boolean(
    coffee.recipeFilter?.trim() ||
      coffee.recipeEspresso?.trim() ||
      coffee.lotInformation?.trim(),
  );
}

const COFFEES_PER_PAGE = 10;

type CoffeeInfoFarmAccordionProps = {
  farm: CoffeeInfoFarm;
};

export function CoffeeInfoFarmAccordion({ farm }: CoffeeInfoFarmAccordionProps) {
  const hasGeneral = Boolean(farm.generalInformation.trim());
  const hasPhotos = farm.photos.length > 0;
  const coffees = useMemo(
    () => farm.coffees.filter(coffeeHasContent),
    [farm.coffees],
  );

  const totalPages = Math.max(1, Math.ceil(coffees.length / COFFEES_PER_PAGE));
  const [page, setPage] = useState(1);

  const pagedCoffees = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * COFFEES_PER_PAGE;
    return coffees.slice(start, start + COFFEES_PER_PAGE);
  }, [coffees, page, totalPages]);

  const defaultOpenKey = hasGeneral
    ? "general"
    : hasPhotos
      ? "photos"
      : pagedCoffees[0]
        ? `coffee::${pagedCoffees[0].name}`
        : null;

  const [openKey, setOpenKey] = useState<string | null>(defaultOpenKey);

  function toggle(key: string) {
    setOpenKey((current) => (current === key ? null : key));
  }

  function goToPage(nextPage: number) {
    const clamped = Math.min(Math.max(1, nextPage), totalPages);
    setPage(clamped);
    setOpenKey(null);
  }

  if (!hasGeneral && !hasPhotos && coffees.length === 0) {
    return null;
  }

  const showPagination = coffees.length > COFFEES_PER_PAGE;
  const safePage = Math.min(page, totalPages);

  return (
    <div>
      {hasGeneral ? (
        <AccordionItem
          label="General Information"
          open={openKey === "general"}
          onToggle={() => toggle("general")}
        >
          <TextBlocks text={farm.generalInformation} />
        </AccordionItem>
      ) : null}

      {hasPhotos ? (
        <AccordionItem
          label="Photos"
          open={openKey === "photos"}
          onToggle={() => toggle("photos")}
        >
          <PhotoGallery photos={farm.photos} />
        </AccordionItem>
      ) : null}

      {pagedCoffees.map((coffee) => {
        const key = `coffee::${coffee.name}`;
        return (
          <AccordionItem
            key={key}
            label={coffee.name}
            open={openKey === key}
            onToggle={() => toggle(key)}
          >
            <div className="space-y-5">
            <RecipeBlock
                title="Lot Information"
                body={coffee.lotInformation}
              />
              <RecipeBlock title="Recipe Filter" body={coffee.recipeFilter} />
            
              <RecipeBlock
                title="Recipe Espresso"
                body={coffee.recipeEspresso}
              />
           
            </div>
          </AccordionItem>
        );
      })}

      {showPagination ? (
        <nav
          aria-label="Coffee list pagination"
          className="mt-6 flex items-center justify-between gap-4"
        >
          <button
            type="button"
            onClick={() => goToPage(safePage - 1)}
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
            onClick={() => goToPage(safePage + 1)}
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
