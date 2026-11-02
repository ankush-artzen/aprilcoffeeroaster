import { getShopBySlug } from "lib/cms/datocms";
import { parseShopAddress, shopGallerySlides } from "lib/cms/shops";
import { structuredTextToHtml } from "lib/cms/structured-text";
import { getLandingPageData } from "lib/get-landing-page";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import ShopPage from "../../../../components/store/shop/shop-page";

export default async function ShopDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();

  const { slug } = await params;

  const [shop, { headerLinks, footerLinks }] = await Promise.all([
    getShopBySlug(slug),
    getLandingPageData(),
  ]);

  if (!shop) {
    notFound();
  }

  const images = shopGallerySlides(shop);

  return (
    <ShopPage
      name={shop.title}
      images={images}
      address={parseShopAddress(shop.address)}
      timing={shop.openingHours ?? undefined}
      miscInformationHtml={structuredTextToHtml(shop.miscInformation)}
      headerLinks={headerLinks}
      footerLinks={footerLinks}
    />
  );
}
