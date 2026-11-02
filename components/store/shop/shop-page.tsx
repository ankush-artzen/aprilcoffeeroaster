import type { ShopGalleryImage } from "lib/cms/shops";
import type { LandingLink } from "lib/landing-types";
import Image from "next/image";
import Footer from "../layout/footer";
import Header from "../layout/header";
// import ShopGalleryCarousel from "./shop-gallery-carousel";

interface ShopPageProps {
  name: string;
  images: ShopGalleryImage[];
  address: string[];
  phone?: string;
  timing?: string;
  miscInformationHtml?: string;
  headerLinks?: LandingLink[];
  footerLinks?: LandingLink[];
}

export default function ShopPage({
  name,
  images,
  address,
  phone,
  timing,
  miscInformationHtml,
  headerLinks,
  footerLinks,
}: ShopPageProps) {
  const hasSidebarInfo =
    address.length > 0 || Boolean(phone) || Boolean(timing);

  return (
    <main className="flex min-h-screen flex-col bg-white text-black">
      <Header navItems={headerLinks} />

      <div className="flex flex-1 grow justify-center pt-0 sm:pt-12">
        <div className="mx-5 flex w-full max-w-5xl">
          <div className="w-full uppercase" aria-label="shop-view">
   

            <div className="flex flex-row max-md:flex-col">
              <h1
                aria-label="shop-title"
                className="type-h1 w-3/4 py-2 text-[17.6px] font-bold sm:text-[18px] sm:leading-[26px] max-md:w-full"
              >
                {name}
              </h1>

           
            </div>

            {miscInformationHtml ? (
              <div
                className="mt-3 normal-case font-normal text-sm max-md:text-xs"
                dangerouslySetInnerHTML={{ __html: miscInformationHtml }}
              />
            ) : null}
            {images.length ? (
              <div className="sm:mt-7.5 mt-2.5 grid grid-cols-3 gap-[20px] sm:px-2.5 px-0 max-md:grid-cols-1">
                {images.map((image, index) => (
                  <div key={image.src || index}>
                    <Image
                      src={image.src}
                      alt={name}
                      width={image.width ?? 800}
                      height={image.height ?? 1000}
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="block h-auto w-full"
                      priority={index < 3}
                    />
                  </div>
                ))}
              </div>
            ) : null}
               {hasSidebarInfo ? (
                <div className="mt-8 w-1/4 whitespace-pre text-sm font-bold max-md:w-auto max-md:text-xs md:w-auto">
                  <div>
                    {address.map((line, lineIndex) => (
                      <p key={lineIndex}>{line || <span>&nbsp;</span>}</p>
                    ))}
                  </div>

                  {phone ? <p>{phone}</p> : null}

                  {timing ? <div>{timing}</div> : null}
                </div>
              ) : null}

          </div>
        </div>
      </div>

      <Footer links={footerLinks} />
    </main>
  );
}
