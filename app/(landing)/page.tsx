import Footer from "components/store/layout/footer";
import Header from "components/store/layout/header";
import {
  TriFergSvg,
  triFergLogoFromFillClass,
} from "components/store/logo/landing-logos";
import { getLandingPageData } from "lib/get-landing-page";
import Link from "next/link";

export default async function PalaceLandingPage() {
  const { triFergNav, headerLinks, footerLinks } = await getLandingPageData();

  return (
    <>
      <Header navItems={headerLinks} landing />
      <main
        role="main"
        id="mainContent"
        className="flex flex-1 grow justify-center"
      >
        {/* <div className="mx-5 flex w-full max-w-5xl"> */}
        <div className="mx-5 sm:mx-0 flex w-full max-w-5xl">
          <div
            className="relative flex w-full flex-1 grow flex-col justify-center px-0"
            aria-label="index-view"
          >
            <nav className="flex flex-col items-center justify-center gap-y-0 pt-0 font-bold uppercase md:flex-row md:gap-9.5 md:pt-6">
              {triFergNav.map((item) => (
                <Link
                  key={item.ariaLabel}
                  href={item.href}
                  aria-label={item.ariaLabel}
                  // target={item.external ? "_blank" : undefined}
                  // rel={item.external ? "noopener noreferrer" : undefined}
                  className="group relative block shrink-0 w-[140px] leading-none md:w-[225px]"
                >
                  <div
                    className="w-full leading-none transition-opacity duration-150 ease-in-out lg:group-hover:opacity-20"
                    aria-label="tri-ferg"
                  >
                    <TriFergSvg
                      logo={triFergLogoFromFillClass(item.fillClass)}
                      className="block h-auto w-full"
                    />
                  </div>
                  <h2 className="type-h2 max-md:mt-0 text-center text-xs leading-tight md:mt-0 md:text-md lg:absolute lg:inset-0 lg:flex lg:w-full lg:items-center lg:justify-center lg:text-xl lg:leading-tight lg:opacity-0 lg:transition-opacity lg:duration-150 lg:ease-in-out lg:group-hover:opacity-100">
       {/* <h2 className="max-md:mt-0 text-center text-xs leading-none md:mt-0 md:text-md lg:absolute lg:inset-0 lg:flex lg:w-full lg:items-center lg:justify-center lg:text-xl lg:opacity-0 lg:transition-opacity lg:duration-150 lg:ease-in-out lg:group-hover:opacity-100"> */}
                    {item.title}
                  </h2>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </main>
      <Footer links={footerLinks} />
    </>
  );
}