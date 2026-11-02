import { getAllShops, isDatoCmsConfigured } from "lib/cms/datocms";
import { toLocationCards } from "lib/cms/shops";
import { getLandingPageData } from "lib/get-landing-page";
import Link from "next/link";
import { connection } from "next/server";
import Footer from "../../../components/store/layout/footer";
import Header from "../../../components/store/layout/header";

export default async function Page() {
  await connection();

  const { headerLinks, footerLinks } = await getLandingPageData();

  let emptyMessage: string | null = null;
  let records: Awaited<ReturnType<typeof getAllShops>> = [];

  if (!isDatoCmsConfigured()) {
    emptyMessage =
      "Shops are not configured in DatoCMS";
  } else {
    try {
      records = await getAllShops();
    } catch (error) {
      console.error("Failed to fetch shops from DatoCMS:", error);
      const detail =
        error instanceof Error ? error.message : "Unknown error";
      emptyMessage =
        process.env.NODE_ENV === "development"
          ? `Failed to load shops: ${detail}`
          : "Unable to load shops right now.";
    }
  }

  if (!emptyMessage && records.length === 0) {
    emptyMessage = "No shops available.";
  }

  const shops = toLocationCards(records);
  return (
    <>
      <Header navItems={headerLinks} />
      <main
        role="main"
        id="mainContent"
        className="flex min-h-screen flex-col bg-white text-black"
      >
        <div className="flex flex-1 grow justify-center pt-0 sm:pt-12">
        <div className="mx-5 flex w-full max-w-5xl">
          <div
            className="flex w-full flex-wrap max-md:flex-col"
            aria-label="shops-view"
          >
            {emptyMessage ? (
              <p className="w-full py-16 text-center text-sm font-bold uppercase tracking-tight">
                {emptyMessage}
              </p>
            ) : null}
            {shops.map((shop) => (
              <Link
                key={shop.link}
                href={shop.link}
                aria-label={shop.title}
                className="mb-2.5 px-2.5 max-md:mb-5 w-1/2 max-md:w-full"
              >
                {/* <div
                  className="
                    relative
                    h-80
                    overflow-hidden
                    bg-[#e9e9e9]
                    duration-75
                    ease-in
                    hover:opacity-30
                    max-md:h-60
                  "
                >
                  <img
                    src={shop.image}
                    alt={shop.title}
                    className="object-cover "
                    // sizes="(max-width:768px) 100vw, 50vw"

                    // className="absolute inset-0 h-full w-full object-cover"
                  />
                </div> */}

                <div
                  className="
    relative
    h-80
    w-full
    overflow-hidden
    bg-[#e9e9e9]
    duration-75
    ease-in
    hover:opacity-30
    max-md:h-60
  "
                >
                  {shop.image ? (
                    <img
                      src={shop.image}
                      alt={shop.title}
                      className="
      absolute
      inset-0
      h-full
      w-full
      object-cover
      opacity-100
      transition-opacity
      duration-500
    "
                    />
                  ) : null}
                </div>

                {/* <div
                  className="
    relative
    h-80
    overflow-hidden
    bg-[#e9e9e9]
    duration-75
    ease-in
    hover:opacity-30
    max-md:h-60
  "
                >
                  <img
                    src={shop.image}
                    alt={shop.title}
                    className="
      absolute
      left-0
      top-0
      h-full
      w-full
      max-w-none
      max-h-none
      object-cover
      opacity-100
      transition-opacity
      duration-500
    "
                  />
                </div> */}

                <h2
                  className="
                    my-2.5
                    text-center
                    text-sm
                    font-bold
                    uppercase
                    tracking-tight
                  "
                >
                  {shop.title}
                </h2>
              </Link>
            ))}
          </div>
        </div>
        </div>

        <Footer links={footerLinks} />
      </main>
    </>
  );
}
