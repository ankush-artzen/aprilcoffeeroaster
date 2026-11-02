import type { AdviceFeedItem, AdviceFeedResponse } from "lib/advice/advice-types";
import {
  getShopifyAdviceBlogHandle,
  getShopifyAdviceCollectionHandle,
  getShopifyAdviceFeedSource,
  getShopifyLookbookBlogHandle,
  SHOPIFY_ADVICE_PAGE_SIZE,
} from "lib/constants";
import {
  getArticle,
  getBlogArticlesPage,
  getProduct,
  loadCollectionProductsPage,
} from "lib/shopify";
import type { Article, Image, Product } from "lib/shopify/types";

type MergedFeedCursor = {
  advice?: string | null;
  lookbook?: string | null;
};

function shopifyImageSrcSet(url: string): string | undefined {
  const base = url.split("?")[0];
  const widths = [200, 400, 600, 800, 1200, 1600, 2400];
  return widths.map((w) => `${base}?width=${w} ${w}w`).join(", ");
}

function encodeMergedCursor(cursor: MergedFeedCursor): string | null {
  if (!cursor.advice && !cursor.lookbook) return null;
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

function decodeMergedCursor(cursor: string | null | undefined): MergedFeedCursor {
  if (!cursor) return {};
  try {
    return JSON.parse(Buffer.from(cursor, "base64url").toString()) as MergedFeedCursor;
  } catch {
    return { advice: cursor };
  }
}

function articlePath(article: Article): string {
  const blogHandle = article.blog.handle;
  const lookbookHandle = getShopifyLookbookBlogHandle();
  if (lookbookHandle && blogHandle === lookbookHandle) {
    return `/lookbook/${article.handle}`;
  }
  return `/projects/${article.handle}`;
}

function articleContentType(article: Article): AdviceFeedItem["contentType"] {
  const lookbookHandle = getShopifyLookbookBlogHandle();
  if (lookbookHandle && article.blog.handle === lookbookHandle) {
    return "lookbook";
  }
  return "advice";
}

function articleToAdviceItem(article: Article): AdviceFeedItem | null {
  const image: Image | null = article.image;
  if (!image?.url) return null;

  const width = image.width || 800;
  const height = image.height || 800;

  return {
    id: article.id,
    title: article.title,
    path: articlePath(article),
    slug: article.handle,
    image: image.url,
    srcSet: shopifyImageSrcSet(image.url),
    width,
    height,
    aspectRatio: width / height,
    contentType: articleContentType(article),
    publishedAt: article.publishedAt,
  };
}

function productToAdviceItem(product: Product): AdviceFeedItem | null {
  const image: Image | undefined = product.featuredImage;
  if (!image?.url) return null;

  const width = image.width || 800;
  const height = image.height || 800;

  return {
    id: product.id,
    title: product.title,
    path: `/product/${product.handle}`,
    slug: product.handle,
    image: image.url,
    srcSet: shopifyImageSrcSet(image.url),
    width,
    height,
    aspectRatio: width / height,
    contentType: "product",
    publishedAt: product.updatedAt,
  };
}

function usesBlogFeed(): boolean {
  const source = getShopifyAdviceFeedSource();
  const adviceBlog = getShopifyAdviceBlogHandle();
  const lookbookBlog = getShopifyLookbookBlogHandle();

  if (source === "products") return false;
  if (source === "blog") return Boolean(adviceBlog || lookbookBlog);
  return Boolean(adviceBlog || lookbookBlog);
}

async function fetchBlogAdviceFeed(options?: {
  cursor?: string | null;
  first?: number;
}): Promise<AdviceFeedResponse> {
  const first = options?.first ?? SHOPIFY_ADVICE_PAGE_SIZE;
  const adviceBlog = getShopifyAdviceBlogHandle();
  const lookbookBlog = getShopifyLookbookBlogHandle();

  if (!adviceBlog && !lookbookBlog) {
    return fetchProductAdviceFeed(options);
  }

  if (adviceBlog && lookbookBlog) {
    const mergedCursor = decodeMergedCursor(options?.cursor);
    const perBlog = Math.ceil(first / 2);

    const [advicePage, lookbookPage] = await Promise.all([
      getBlogArticlesPage({
        blogHandle: adviceBlog,
        first: perBlog,
        after: mergedCursor.advice,
      }),
      getBlogArticlesPage({
        blogHandle: lookbookBlog,
        first: perBlog,
        after: mergedCursor.lookbook,
      }),
    ]);

    const articles = [
      ...(advicePage?.articles ?? []),
      ...(lookbookPage?.articles ?? []),
    ].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

    const adviceFeed = articles
      .slice(0, first)
      .flatMap((article) => {
        const item = articleToAdviceItem(article);
        return item ? [item] : [];
      });

    const hasNextPage = Boolean(
      advicePage?.pageInfo.hasNextPage || lookbookPage?.pageInfo.hasNextPage,
    );

    return {
      adviceFeed,
      adviceFeedMetadata: {
        count: adviceFeed.length,
        hasNextPage,
        endCursor: encodeMergedCursor({
          advice: advicePage?.pageInfo.endCursor,
          lookbook: lookbookPage?.pageInfo.endCursor,
        }),
      },
    };
  }

  const blogHandle = adviceBlog ?? lookbookBlog!;
  const page = await getBlogArticlesPage({
    blogHandle,
    first,
    after: options?.cursor,
  });

  if (!page) {
    return {
      adviceFeed: [],
      adviceFeedMetadata: {
        count: 0,
        hasNextPage: false,
        endCursor: null,
      },
    };
  }

  const adviceFeed = page.articles.flatMap((article) => {
    const item = articleToAdviceItem(article);
    return item ? [item] : [];
  });

  return {
    adviceFeed,
    adviceFeedMetadata: {
      count: adviceFeed.length,
      hasNextPage: page.pageInfo.hasNextPage,
      endCursor: page.pageInfo.endCursor,
    },
  };
}

async function fetchProductAdviceFeed(options?: {
  cursor?: string | null;
  first?: number;
}): Promise<AdviceFeedResponse> {
  const page = await loadCollectionProductsPage({
    collection: getShopifyAdviceCollectionHandle(),
    cursor: options?.cursor,
    first: options?.first ?? SHOPIFY_ADVICE_PAGE_SIZE,
  });

  const adviceFeed = page.products.flatMap((product) => {
    const item = productToAdviceItem(product);
    return item ? [item] : [];
  });

  return {
    adviceFeed,
    adviceFeedMetadata: {
      count: adviceFeed.length,
      hasNextPage: page.pageInfo.hasNextPage,
      endCursor: page.pageInfo.endCursor,
    },
  };
}

export async function fetchShopifyAdviceFeed(options?: {
  cursor?: string | null;
  first?: number;
}): Promise<AdviceFeedResponse> {
  if (usesBlogFeed()) {
    return fetchBlogAdviceFeed(options);
  }
  return fetchProductAdviceFeed(options);
}

export async function fetchShopifyAdviceBySlug(
  slug: string,
): Promise<AdviceFeedItem | undefined> {
  const adviceBlog = getShopifyAdviceBlogHandle();
  const lookbookBlog = getShopifyLookbookBlogHandle();

  if (adviceBlog) {
    const article = await getArticle({
      blogHandle: adviceBlog,
      articleHandle: slug,
    });
    if (article) return articleToAdviceItem(article) ?? undefined;
  }

  if (lookbookBlog) {
    const article = await getArticle({
      blogHandle: lookbookBlog,
      articleHandle: slug,
    });
    if (article) return articleToAdviceItem(article) ?? undefined;
  }

  const product = await getProduct(slug);
  if (!product) return undefined;

  return productToAdviceItem(product) ?? undefined;
}

export async function fetchShopifyArticleDetail(
  contentType: "advice" | "lookbook",
  slug: string,
): Promise<Article | null> {
  const blogHandle =
    contentType === "lookbook"
      ? getShopifyLookbookBlogHandle()
      : getShopifyAdviceBlogHandle();

  if (!blogHandle) return null;

  return getArticle({ blogHandle, articleHandle: slug });
}
