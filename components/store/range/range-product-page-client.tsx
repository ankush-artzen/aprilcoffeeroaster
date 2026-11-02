"use client";

import type { DatoResponsiveImage } from "lib/cms/datocms";
import type { RangeProductPageData } from "lib/store/map-range-product-page-data";
import { useCallback, useState } from "react";

const PLACEHOLDER_SVG =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiPjwvc3ZnPg==";

function GalleryArrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      fill="#D1D5DB"
      xmlns="http://www.w3.org/2000/svg"
      width="12px"
      height="14px"
      viewBox="0 0 123.96 123.96"
      strokeWidth={0}
      className={`hover:fill-black ${direction === "right" ? "rotate-180" : "rotate-0"}`}
    >
      <path d="M85.742,1.779l-56,56c-2.3,2.3-2.3,6.1,0,8.401l56,56c3.801,3.8,10.2,1.1,10.2-4.2v-112 C95.942,0.679,89.543-2.021,85.742,1.779z" />
    </svg>
  );
}

function GallerySlide({ image }: { image: DatoResponsiveImage }) {
  return (
    <div
      className="w-full shrink-0"
      style={{
        overflow: "hidden",
        position: "relative",
        width: "100%",
        maxWidth: "1024px",
        maxHeight: "42rem",
      }}
    >
      <img
        style={{ display: "block", width: "100%" }}
        src={PLACEHOLDER_SVG}
        aria-hidden
        alt=""
      />
      <picture>
        {image.srcSet ? (
          <source srcSet={image.srcSet} sizes="100vw" />
        ) : null}
        <img
          alt=""
          referrerPolicy="no-referrer-when-downgrade"
          src={image.src}
          style={{
            opacity: 1,
            transition: "opacity 500ms",
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            maxWidth: "none",
            maxHeight: "none",
            objectFit: "contain",
          }}
        />
      </picture>
    </div>
  );
}

export default function RangeProductPageClient({
  title,
  descriptionHtml,
  images,
}: RangeProductPageData) {
  const [selectedImage, setSelectedImage] = useState(0);
  const count = images.length;
  const hasMultipleImages = count > 1;
  const slideOffset = count > 0 ? (selectedImage * 100) / count : 0;

  const goToImage = useCallback(
    (direction: "prev" | "next") => {
      if (count === 0) return;
      setSelectedImage((current) => {
        const delta = direction === "next" ? 1 : -1;
        return (current + delta + count) % count;
      });
    },
    [count],
  );

  return (
    <main
      role="main"
      id="mainContent"
      className="flex flex-1 grow justify-center bg-white text-black"
    >
      <div className="mx-5 flex w-full max-w-5xl">
        <div aria-label="product-view" className="w-full text-sm font-bold uppercase">
          {count > 0 ? (
            <div
              aria-label="gallery-carousel"
              className="flex flex-col items-center"
            >
              <div
                className="relative flex w-full overflow-hidden transition-[height] duration-300"
                style={{ maxHeight: "42rem" }}
              >
                {hasMultipleImages ? (
                  <button
                    type="button"
                    aria-label="left-gallery-button"
                    onClick={() => goToImage("prev")}
                    className="z-10 cursor-pointer bg-white p-2 max-md:absolute max-md:left-0 max-md:h-full max-md:bg-transparent"
                  >
                    <GalleryArrow direction="left" />
                  </button>
                ) : null}

                <div className="min-w-0 flex-1 overflow-hidden">
                  <div
                    aria-label="gallery-images"
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                      transform: `translateX(-${slideOffset}%)`,
                      width: `${count * 100}%`,
                    }}
                  >
                    {images.map((image) => (
                      <div
                        key={image.src}
                        aria-label={`image-${image.src}`}
                        className="shrink-0"
                        style={{ flex: `0 0 ${100 / count}%` }}
                      >
                        <GallerySlide image={image} />
                      </div>
                    ))}
                  </div>
                </div>

                {hasMultipleImages ? (
                  <button
                    type="button"
                    aria-label="right-gallery-button"
                    onClick={() => goToImage("next")}
                    className="z-10 cursor-pointer bg-white p-2 max-md:absolute max-md:right-0 max-md:h-full max-md:bg-transparent"
                  >
                    <GalleryArrow direction="right" />
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          <h2
            aria-label="product-variant-title"
            className="max-md:text-center"
          >
            {title}
          </h2>

          {descriptionHtml ? (
            <p
              className="max-md:text-center"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
