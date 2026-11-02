import Footer from "components/store/layout/footer";
import Header from "components/store/layout/header";
import { PartnersFeed } from "components/partners/partners-feed";
import { getPartnersFeed } from "lib/cms/partners";
import { getLandingPageData } from "lib/get-landing-page";
import { connection } from "next/server";

export const metadata = {
  title: "Partners",
  description:
    "Wholesale partners and cafés serving April Coffee around the world.",
};

export default async function PartnersPage() {
  await connection();

  const [{ headerLinks, footerLinks }, feed] = await Promise.all([
    getLandingPageData(),
    getPartnersFeed().catch((error) => {
      console.error("Failed to load partners from DatoCMS:", error);
      return {
        partners: [],
        partnersMetadata: {
          count: 0,
          totalCount: 0,
          hasNextPage: false,
          endCursor: null,
        },
      };
    }),
  ]);

  return (
    <>
      <Header navItems={headerLinks} />

      <main
        role="main"
        id="mainContent"
        className="flex w-full min-w-0 flex-1 grow justify-center overflow-x-hidden"
      >
        <div className="flex w-full min-w-0 flex-1 grow justify-center pt-0 sm:pt-12">
          <div className="mx-5 flex w-full min-w-0 max-w-5xl">
            <div className="block min-w-0 w-full">
              <PartnersFeed
                initialPartners={feed.partners}
                initialMetadata={feed.partnersMetadata}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer links={footerLinks} />
    </>
  );
}
