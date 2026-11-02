import { getAdviceFeed } from "lib/advice/get-advice-feed";
import { getLandingPageData } from "lib/get-landing-page";
import { AdviceFeedGrid } from "../../../components/advice/advice-feed-grid";
import Footer from "../../../components/store/layout/footer";
import Header from "../../../components/store/layout/header";

export default async function AdvicePage() {
  const [{ adviceFeed, adviceFeedMetadata }, { headerLinks, footerLinks }] =
    await Promise.all([getAdviceFeed(), getLandingPageData()]);

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
              <AdviceFeedGrid
                initialFeed={adviceFeed}
                initialMetadata={adviceFeedMetadata}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer links={footerLinks} />
    </>
  );
}
