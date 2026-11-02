import type { DatoRangeProductRecord } from "lib/cms/range";
import type { DatoResponsiveImage } from "lib/cms/datocms";
import Link from "next/link";

const PLACEHOLDER_SVG =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iODAwIj48L3N2Zz4=";

const IMAGE_SIZES = "(min-width: 768px) 17vw, 50vw";

function RangeProductImage({
  image,
}: {
  image: DatoResponsiveImage | null | undefined;
}) {
  if (!image?.src) {
    return (
      <div
        className="transition-opacity duration-150 ease-in-out group-hover:opacity-30"
        style={{
          overflow: "hidden",
          position: "relative",
          width: "100%",
          maxWidth: "800px",
        }}
      >
        <img
          aria-hidden
          alt=""
          src={PLACEHOLDER_SVG}
          style={{ display: "block", width: "100%" }}
        />
        <div
          className="absolute inset-0 bg-neutral-100"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div
      className="transition-opacity duration-150 ease-in-out group-hover:opacity-30"
      style={{
        overflow: "hidden",
        position: "relative",
        width: "100%",
        maxWidth: "800px",
      }}
    >
      <img
        aria-hidden
        alt=""
        src={PLACEHOLDER_SVG}
        style={{ display: "block", width: "100%" }}
      />
      <picture>
        {image.webpSrcSet ? (
          <source srcSet={image.webpSrcSet} sizes={IMAGE_SIZES} type="image/webp" />
        ) : null}
        {image.srcSet ? (
          <source srcSet={image.srcSet} sizes={IMAGE_SIZES} />
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
            objectFit: "cover",
          }}
        />
      </picture>
    </div>
  );
}

export default function RangeProductCard({
  product,
  rangeSlug,
}: {
  product: DatoRangeProductRecord;
  rangeSlug: string;
}) {
  const href = `/range/${rangeSlug}/product/${product.slug}`;
  const title = product.title.toUpperCase();

  return (
    <Link
      href={href}
      aria-label={product.slug}
      prefetch={true}
      className="group relative w-1/6 max-md:w-1/2"
    >
      <RangeProductImage image={product.thumbnail?.responsiveImage} />

      <div className="absolute left-0 top-2/4 inline-block w-full -translate-y-1/2 text-center text-sm font-bold opacity-0 transition-opacity duration-150 ease-in-out group-hover:opacity-100 max-md:invisible max-md:hidden md:invisible md:hidden">
        <div className="float-none w-full">
          <h3>{title}</h3>
        </div>
      </div>
    </Link>
  );
}
