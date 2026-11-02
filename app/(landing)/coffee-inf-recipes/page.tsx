import { CoffeeInfoFarmsList } from "components/coffee-info/coffee-info-farms-list";
import { FaqAccordion } from "components/contact/faq-accordion";
import Footer from "components/store/layout/footer";
import Header from "components/store/layout/header";
import { getAllCoffeeInfoFarms } from "lib/cms/coffee-info";
import {
  coffeeInfoBrewingSection,
  coffeeInfoPageIntro,
  coffeeInfoPurchasingSection,
} from "lib/coffee-info/content";
import type { FaqSection } from "lib/contact/faq-content";
import { getLandingPageData } from "lib/get-landing-page";
import { connection } from "next/server";

export const metadata = {
  title: "Coffee Info & Recipes",
  description:
    "Brewing guides, farm information, and recipes for April Coffee Roasters coffees.",
};

export default async function CoffeeInfRecipesPage() {
  await connection();

  const { headerLinks, footerLinks } = await getLandingPageData();

  let farms: Awaited<ReturnType<typeof getAllCoffeeInfoFarms>> = [];
  try {
    farms = await getAllCoffeeInfoFarms();
  } catch (error) {
    console.error("Failed to load coffee info farms:", error);
  }

  const brewingSections: FaqSection[] = [
    {
      title: coffeeInfoPurchasingSection.title,
      items: coffeeInfoPurchasingSection.items.map((item) => ({
        question: item.question,
        answer: item.answer,
      })),
      note: coffeeInfoPurchasingSection.note,
    },
    {
      title: coffeeInfoBrewingSection.title,
      description: coffeeInfoBrewingSection.description,
      items: coffeeInfoBrewingSection.items.map((item) => ({
        question: item.question,
        answer: item.answer,
      })),
    },
  ];

  return (
    <>
      <Header navItems={headerLinks} />

      <main
        role="main"
        id="mainContent"
        className="flex w-full min-w-0 flex-1 grow justify-center overflow-x-hidden"
      >
        <div className="mx-5 flex w-full min-w-0 max-w-3xl flex-col py-10 md:py-14">
          <header className="mb-10 text-center">
            <h1 className="type-h1 text-2xl uppercase md:text-3xl">
              Coffee Info
              <br />
              &amp; Recipes
            </h1>
            <p className="type-text mx-auto mt-5 max-w-xl text-[13px] leading-[18px]">
              {coffeeInfoPageIntro}
            </p>
          </header>

          <FaqAccordion sections={brewingSections} />

          <section id="farms" className="mt-12 scroll-mt-8" aria-label="Farms">
            {/* <h2 className="type-h2 mb-1 text-sm uppercase">Farm Name</h2>
            <p className="type-text mb-3 text-[13px] leading-[18px]">
            On this page you can find information and brewing guides to all coffees that we are currently working with and that are available on our shop, along with informations on the farm with are partnering with.
            We believe in diversifying the brewing approach to get the best out of each coffee.
            </p> */}

            <CoffeeInfoFarmsList
              farms={farms.map((farm) => ({
                slug: farm.slug,
                title: farm.title,
              }))}
            />
          </section>
        </div>
      </main>

      <Footer links={footerLinks} />
    </>
  );
}
