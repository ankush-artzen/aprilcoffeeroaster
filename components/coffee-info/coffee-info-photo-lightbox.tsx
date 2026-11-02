"use client";

import type { CoffeeInfoPhoto } from "lib/coffee-info/content";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

function LightboxArrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 123.96 123.96"
      strokeWidth={0}
      className={direction === "right" ? "rotate-180" : undefined}
      aria-hidden
    >
      <path d="M85.742,1.779l-56,56c-2.3,2.3-2.3,6.1,0,8.401l56,56c3.801,3.8,10.2,1.1,10.2-4.2v-112 C95.942,0.679,89.543-2.021,85.742,1.779z" />
    </svg>
  );
}

type CoffeeInfoPhotoLightboxProps = {
  photos: CoffeeInfoPhoto[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

export function CoffeeInfoPhotoLightbox({
  photos,
  index,
  onClose,
  onIndexChange,
}: CoffeeInfoPhotoLightboxProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const count = photos.length;
  const photo = photos[index];

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      onIndexChange(((next % count) + count) % count);
    },
    [count, onIndexChange],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        goTo(index - 1);
        return;
      }
      if (event.key === "ArrowRight") {
        goTo(index + 1);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goTo, index, onClose]);

  if (!mounted || !photo) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-8"
      onClick={onClose}
    >
      <p id={titleId} className="sr-only">
        {photo.alt || `Photo ${index + 1} of ${count}`}
      </p>

      <button
        type="button"
        aria-label="Close lightbox"
        className="absolute right-4 top-4 z-20 cursor-pointer px-2 py-1 text-sm uppercase tracking-wide text-white/80 hover:text-white"
        onClick={onClose}
      >
        Close
      </button>

      {count > 1 ? (
        <button
          type="button"
          aria-label="Previous photo"
          className="absolute left-2 top-1/2 z-20 -translate-y-1/2 cursor-pointer p-3 text-white/70 hover:text-white sm:left-4"
          onClick={(event) => {
            event.stopPropagation();
            goTo(index - 1);
          }}
        >
          <LightboxArrow direction="left" />
        </button>
      ) : null}

      <div
        className="relative flex max-h-full max-w-5xl flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.fullSrc || photo.src}
          alt={photo.alt || `Photo ${index + 1}`}
          className="max-h-[min(80vh,900px)] max-w-full object-contain"
        />
        {count > 1 ? (
          <p className="mt-3 text-sm uppercase tracking-wide text-white/70">
            {index + 1} / {count}
          </p>
        ) : null}
      </div>

      {count > 1 ? (
        <button
          type="button"
          aria-label="Next photo"
          className="absolute right-2 top-1/2 z-20 -translate-y-1/2 cursor-pointer p-3 text-white/70 hover:text-white sm:right-4"
          onClick={(event) => {
            event.stopPropagation();
            goTo(index + 1);
          }}
        >
          <LightboxArrow direction="right" />
        </button>
      ) : null}
    </div>,
    document.body,
  );
}
