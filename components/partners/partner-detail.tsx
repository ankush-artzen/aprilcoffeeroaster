import type { PartnerDetail, PartnerImage } from "lib/cms/partners";
import Image from "next/image";

function PartnerPhoto({
  image,
  alt,
  sizes,
  className,
  priority = false,
}: {
  image: PartnerImage;
  alt: string;
  sizes: string;
  className: string;
  priority?: boolean;
}) {
  const width = image.width || 800;
  const height = image.height || 1000;

  if (image.external) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- arbitrary CMS image URLs
      <img
        src={image.src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return (
    <Image
      src={image.src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  );
}

export function PartnerDetailView({ partner }: { partner: PartnerDetail }) {
  const editorialImages = partner.images.slice(0, 6);
  const productImages = partner.images.slice(6);
  const sidebarText = partner.info ?? partner.address;

  return (
    <main
      role="main"
      id="mainContent"
      className="flex w-full min-w-0 flex-1 grow justify-center overflow-x-hidden pt-0 sm:pt-12"
    >
      <div className="mx-5 flex w-full min-w-0 max-w-5xl">
        <div
          aria-label="partner-item-view"
          className="w-full min-w-0 pb-4 uppercase"
        >
          <div className="flex min-w-0 flex-row max-md:flex-col">
            <h1
              aria-label="partner-item-title"
              className="type-h1 w-3/4 min-w-0 py-2 text-[17.6px] font-bold sm:text-[18px] sm:leading-[26px] max-md:w-full"
            >
              {partner.title}
            </h1>

            <div className="w-1/4 min-w-0 whitespace-pre-wrap break-words text-sm font-bold max-md:w-auto max-md:text-xs md:w-auto">
              {partner.country ? (
                <p aria-label="partner-item-country">{partner.country}</p>
              ) : null}
              {sidebarText ? (
                <p
                  aria-label="partner-item-description"
                  className={partner.country ? "mt-1" : undefined}
                >
                  {sidebarText}
                </p>
              ) : null}
            </div>
          </div>

          {editorialImages.length ? (
            <div className="mt-2.5 grid grid-cols-3 gap-[20px] px-0 sm:mt-7.5 sm:px-2.5 max-md:grid-cols-1">
              {editorialImages.map((image, index) => (
                <div key={image.src || index} className="min-w-0">
                  <PartnerPhoto
                    image={image}
                    alt={partner.title}
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="block h-auto w-full"
                    priority={index < 3}
                  />
                </div>
              ))}
            </div>
          ) : null}

          {productImages.length ? (
            <div className="mt-14 grid grid-cols-3 gap-x-10 gap-y-20 px-8 max-md:grid-cols-2 max-md:gap-x-5 max-md:gap-y-10 max-md:px-2.5">
              {productImages.map((image, index) => (
                <div
                  key={image.src || index}
                  className="flex min-w-0 items-center justify-center"
                >
                  <PartnerPhoto
                    image={image}
                    alt={partner.title}
                    sizes="(max-width:768px) 50vw, 33vw"
                    className="block h-auto w-full object-contain"
                  />
                </div>
              ))}
            </div>
          ) : null}

          {partner.contentHtml ? (
            <div
              className="mt-10 break-words normal-case font-normal text-sm max-md:text-xs [&_img]:h-auto [&_img]:max-w-full"
              dangerouslySetInnerHTML={{ __html: partner.contentHtml }}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
