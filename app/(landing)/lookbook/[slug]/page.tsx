import { ArticleDetail } from "../../../../components/advice/article-detail";
import Footer from "../../../../components/store/layout/footer";
import Header from "../../../../components/store/layout/header";
import { shopifyArticleToDetail } from "lib/advice/get-advice-detail";
import { getLandingPageData } from "lib/get-landing-page";
import { fetchShopifyArticleDetail } from "lib/advice/shopify-advice";
import { notFound } from "next/navigation";

export default async function LookbookArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [article, { headerLinks, footerLinks }] = await Promise.all([
    fetchShopifyArticleDetail("lookbook", slug),
    getLandingPageData(),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <>
      <Header navItems={headerLinks} />
      <ArticleDetail article={shopifyArticleToDetail(article)} />
      <Footer links={footerLinks} />
    </>
  );
}
