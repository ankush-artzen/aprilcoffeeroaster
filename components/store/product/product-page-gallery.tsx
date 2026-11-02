"use client";

import clsx from "clsx";
import type { ProductPageImage } from "components/store/product/product-page-types";
import Image from "next/image";
import { useEffect, useRef, type UIEvent } from "react";

function CarouselArrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      fill="#d1d5db"
      xmlns="http://www.w3.org/2000/svg"
      width="16px"
      height="16px"
      viewBox="0 0 123.96 123.96"
      strokeWidth={0}
      className={`hover:fill-black ${direction === "right" ? "rotate-180" : "rotate-0"}`}
    >
      <path d="M85.742,1.779l-56,56c-2.3,2.3-2.3,6.1,0,8.401l56,56c3.801,3.8,10.2,1.1,10.2-4.2v-112 C95.942,0.679,89.543-2.021,85.742,1.779z" />
    </svg>
  );
}

type ProductPageGalleryProps = {
  title: string;
  images: ProductPageImage[];
  galleryMode: boolean;
  selectedImage: number;
  onSelectedImageChange: (index: number) => void;
  onGalleryModeChange: (open: boolean) => void;
};

export default function ProductPageGallery({
  title,
  images,
  galleryMode,
  selectedImage,
  onSelectedImageChange,
  onGalleryModeChange,
}: ProductPageGalleryProps) {
  const mobileCarouselRef = useRef<HTMLDivElement>(null);
  const desktopCarouselRef = useRef<HTMLDivElement>(null);

  const getActiveCarousel = () => {
    if (typeof window === "undefined") {
      return desktopCarouselRef.current;
    }
    return window.matchMedia("(max-width: 767px)").matches
      ? mobileCarouselRef.current
      : desktopCarouselRef.current;
  };

  const handleCarouselScroll = (event: UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    if (index !== selectedImage) {
      onSelectedImageChange(index);
    }
  };

  const scrollToImage = (index: number) => {
    if (images.length === 0) return;

    const nextIndex = ((index % images.length) + images.length) % images.length;
    onSelectedImageChange(nextIndex);
    const container = getActiveCarousel();
    if (container) {
      container.scrollTo({
        left: nextIndex * container.clientWidth,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (!galleryMode) return;
    const container = mobileCarouselRef.current;
    if (!container) return;
    container.scrollTo({
      left: selectedImage * container.clientWidth,
      behavior: "auto",
    });
    // Sync scroll position only when gallery opens
    // eslint-disable-next-line react-hooks/exhaustive-deps -- selectedImage read at open time
  }, [galleryMode]);

  if (images.length === 0) return null;

  return (
    <div
      className={`
    min-w-0
    max-md:w-full

    ${
      galleryMode
        ? "w-full cursor-zoom-out"
        : "w-[68%] cursor-zoom-in max-md:cursor-zoom-in"
    }
  `}
    >
      {/* Mobile: swipe carousel; tap image to open gallery with arrows */}
      <div
        id="slider"
        className={clsx(
          "m-auto mt-0 hidden max-md:block",
          galleryMode ? "cursor-zoom-out" : "cursor-zoom-in",
        )}
        onClick={() =>
          galleryMode ? onGalleryModeChange(false) : onGalleryModeChange(true)
        }
      >
        <div aria-label="product-images-carousel">
          <div
            className="nuka-container relative"
            aria-labelledby="nuka-carousel-heading"
            tabIndex={0}
            id="nuka-carousel"
          >
            <div className="nuka-slide-container">
              <div
                ref={mobileCarouselRef}
                id="nuka-overflow"
                data-testid="nuka-overflow"
                className="nuka-overflow scroll-smooth overflow-x-auto snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ touchAction: "pan-y" }}
                onScroll={handleCarouselScroll}
              >
                <div
                  id="nuka-wrapper"
                  data-testid="nuka-wrapper"
                  className="nuka-wrapper flex"
                >
                  {images.map((image, index) => (
                    <div
                      key={image.label}
                      className="w-full shrink-0 basis-full snap-start"
                    >
                      <Image
                        alt={title}
                        src={image.src}
                        width={700}
                        height={700}
                        unoptimized
                        sizes="100vw"
                        priority={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                        aria-label={image.label}
                        data-zoom={image.zoom}
                        className="aspect-square w-full shrink-0 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {images.length > 1 && galleryMode ? (
                <div>
                  <button
                    type="button"
                    aria-label="left-slide-button"
                    className="invisible absolute bottom-1/2 left-0 mx-3 cursor-pointer !visible"
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToImage(selectedImage - 1);
                    }}
                  >
                    <CarouselArrow direction="left" />
                  </button>

                  <button
                    type="button"
                    aria-label="right-slide-button"
                    className="invisible absolute bottom-1/2 right-0 mx-3 cursor-pointer !visible"
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToImage(selectedImage + 1);
                    }}
                  >
                    <CarouselArrow direction="right" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {images.length > 1 && galleryMode ? (
            <div
              aria-label="carousel-control-dots"
              className="flex justify-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((image, index) => (
                <button
                  key={`dot-${image.label}`}
                  type="button"
                  aria-label={`slide ${index + 1} bullet`}
                  aria-current={index === selectedImage ? "true" : undefined}
                  className={clsx(
                    "m-[2.5px] h-1 w-2 cursor-pointer",
                    index === selectedImage
                      ? "bg-slate-400 hover:bg-slate-400"
                      : "bg-slate-200 hover:bg-slate-400",
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollToImage(index);
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {!galleryMode ? (
        <>
          {/* Desktop: click-to-zoom carousel + thumbnails */}
          <div
            className="m-auto mt-0 max-md:hidden"
            onClick={() => onGalleryModeChange(true)}
          >
            <div aria-label="product-images-carousel">
              <div
                className="relative"
                aria-labelledby="nuka-carousel-heading"
                tabIndex={0}
                id="nuka-carousel-desktop"
              >
                <div className="relative">
                  <div
                    ref={desktopCarouselRef}
                    className="grid auto-cols-[100%] grid-flow-col overflow-x-auto scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    style={{ touchAction: "pan-y" }}
                    onScroll={handleCarouselScroll}
                  >
                    {images.map((image, index) => (
                      <div key={image.label} className="min-w-0 snap-start">
                        <Image
                          alt={title}
                          src={image.src}
                          width={700}
                          height={700}
                          unoptimized
                          sizes="(min-width: 45em) 50vw, 100vw"
                          priority={index === 0}
                          loading={index === 0 ? "eager" : "lazy"}
                          aria-label={image.label}
                          data-zoom={image.zoom}
                          className="aspect-square w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  {images.length > 1 ? (
                    <div>
                      <button
                        type="button"
                        aria-label="left-slide-button"
                        className="invisible absolute bottom-1/2 left-0 mx-3 cursor-pointer !visible"
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollToImage(selectedImage - 1);
                        }}
                      >
                        <CarouselArrow direction="left" />
                      </button>

                      <button
                        type="button"
                        aria-label="right-slide-button"
                        className="invisible absolute bottom-1/2 right-0 mx-3 cursor-pointer !visible"
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollToImage(selectedImage + 1);
                        }}
                      >
                        <CarouselArrow direction="right" />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* THUMBNAILS */}
          {images.length > 1 ? (
            <div
              aria-label="product-images-grid"
              id="product-images-grid"
              className="
          mt-4
          w-full

          max-md:hidden
        "
            >
              <div
                aria-label="photos-wrapper"
                className="m-auto grid max-w-[480px] grid-cols-5 text-center justify-center"
              >
                {images.map((image, index) => (
                  <button
                    key={image.label}
                    type="button"
                    aria-label="product-thumb"
                    id={`product-thumb-${index}`}
                    className={`p-0.5 transition duration-150 ease-in-out hover:cursor-pointer hover:opacity-40 ${
                      index === selectedImage ? "opacity-40" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToImage(index);
                    }}
                  >
                    <Image
                      alt=""
                      src={image.thumbSrc}
                      width={90}
                      height={90}
                      unoptimized
                      sizes="(min-width: 45em) 50vw, 100vw"
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        /* ZOOM GALLERY (desktop only) */
        <div
          className="w-full cursor-zoom-out max-md:hidden"
          aria-label="product-images-gallery"
          onClick={() => onGalleryModeChange(false)}
        >
          {images.map((image, index) => (
            <div
              key={image.label}
              aria-label={`${title}-image-${index}`}
              className="pb-4"
            >
              <Image
                alt={title}
                src={image.src}
                width={1500}
                height={1500}
                unoptimized
                loading="lazy"
                className="w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
