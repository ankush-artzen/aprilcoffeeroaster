import Link from "next/link";

function aspectRatioPlaceholder(width: number, height: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export type AdviceCardProps = {
  title: string;
  href: string;
  image: string;
  srcSet?: string;
  width: number;
  height: number;
  layout?: "mobile" | "desktop";
};

export function AdviceCard({
  title,
  href,
  image,
  srcSet,
  width,
  height,
  layout = "desktop",
}: AdviceCardProps) {
  const placeholderSrc = aspectRatioPlaceholder(width, height);
  const isMobile = layout === "mobile";
  const imageSizes = isMobile ? "100vw" : "(min-width: 768px) 33vw, 100vw";

  return (
    <div className={isMobile ? "mb-5 last:mb-0" : "pt-0"}>
      <div
        className={
          isMobile
            ? "group relative w-full"
            : "group relative p-2.5 text-center uppercase"
        }
      >
        <Link href={href} className={isMobile ? "block w-full" : undefined}>
          <div
            className={
              isMobile
                ? "relative w-full overflow-hidden"
                : "w-full max-w-[800px] transition-opacity duration-150 ease-in-out group-hover:opacity-10"
            }
            style={
              isMobile
                ? undefined
                : {
                    overflow: "hidden",
                    position: "relative",
                    width: "100%",
                  }
            }
          >
            <img
              aria-hidden
              alt=""
              src={placeholderSrc}
              className="block w-full"
            />
            {srcSet ? (
              <picture>
                <source srcSet={srcSet} sizes={imageSizes} />
                <img
                  alt=""
                  src={image}
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute left-0 top-0 h-full w-full max-h-none max-w-none object-cover opacity-100 transition-opacity duration-500"
                />
              </picture>
            ) : (
              <img
                alt=""
                src={image}
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute left-0 top-0 h-full w-full max-h-none max-w-none object-cover opacity-100 transition-opacity duration-500"
              />
            )}
          </div>

          {!isMobile ? (
            <div className="absolute left-0 top-2/4 inline-block w-full -translate-y-1/2 text-center text-sm font-bold opacity-0 transition-opacity duration-150 ease-in-out group-hover:opacity-100">
              <div className="float-none w-full duration-150 ease-in-out group-hover:transition-colors">
                <h3 className="m-0" aria-label="advice-feed">
                  {title}
                </h3>
              </div>
            </div>
          ) : null}
        </Link>
      </div>
    </div>
  );
}
