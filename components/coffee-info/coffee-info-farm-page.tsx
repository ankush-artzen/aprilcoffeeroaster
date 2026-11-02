import { CoffeeInfoFarmAccordion } from "components/coffee-info/coffee-info-accordion";
import { CoffeeInfoFarmVideo } from "components/coffee-info/coffee-info-farm-video";
import Footer from "components/store/layout/footer";
import Header from "components/store/layout/header";
import type { CoffeeInfoFarm } from "lib/coffee-info/content";
import type { LandingLink } from "lib/landing-types";
import Link from "next/link";

type CoffeeInfoFarmPageProps = {
  farm: CoffeeInfoFarm;
  headerLinks: LandingLink[];
  footerLinks: LandingLink[];
};

export function CoffeeInfoFarmPage({
  farm,
  headerLinks,
  footerLinks,
}: CoffeeInfoFarmPageProps) {
  return (
    <>
      <Header navItems={headerLinks} />

      <main
        role="main"
        id="mainContent"
        className="flex w-full min-w-0 flex-1 grow justify-center overflow-x-hidden"
      >
        <div className="mx-5 flex w-full min-w-0 max-w-3xl flex-col py-10 md:py-14">
          <p className="type-text mb-6 text-[12px] uppercase leading-[16px]">
            <Link
              href="/coffee-inf-recipes"
              className="underline underline-offset-2 outline outline-[2pt] outline-transparent outline-offset-2 transition duration-150 ease-in-out hover:outline-hover-frame"
            >
              Coffee Info &amp; Recipes
            </Link>
          </p>

          <header className="mb-6">
            <h1 className="type-h2 text-sm uppercase">{farm.title}</h1>
            {farm.description.trim() ? (
              <div className="type-text mt-3 max-w-2xl space-y-3 text-[13px] leading-[18px]">
                {farm.description.split(/\n\n+/).map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}
          </header>

          {farm.video ? <CoffeeInfoFarmVideo video={farm.video} /> : null}

          <CoffeeInfoFarmAccordion farm={farm} />
        </div>
      </main>

      <Footer links={footerLinks} />
    </>
  );
}
