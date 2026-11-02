import { PartnerDetailView } from "components/partners/partner-detail";
import Footer from "components/store/layout/footer";
import Header from "components/store/layout/header";
import { getPartnerBySlug } from "lib/cms/partners";
import { getLandingPageData } from "lib/get-landing-page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const partner = await getPartnerBySlug(slug);

  if (!partner) {
    return { title: "Partner" };
  }

  return {
    title: partner.title,
    description: partner.address ?? partner.info ?? undefined,
  };
}

export default async function PartnerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();

  const { slug } = await params;

  const [partner, { headerLinks, footerLinks }] = await Promise.all([
    getPartnerBySlug(slug),
    getLandingPageData(),
  ]);

  if (!partner) {
    notFound();
  }

  return (
    <>
      <Header navItems={headerLinks} />
      <PartnerDetailView partner={partner} />
      <Footer links={footerLinks} />
    </>
  );
}
