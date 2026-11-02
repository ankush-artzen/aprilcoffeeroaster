import { cartCookieOptions } from "lib/cart-cookie";
import {
  COLLECTION_PRODUCTS_PAGE_SIZE,
  HIDDEN_PRODUCT_TAG,
  SHOPIFY_GRAPHQL_API_ENDPOINT,
  TAGS,
} from "lib/constants";
import { isShopifyError } from "lib/type-guards";
import { ensureStartsWith } from "lib/utils";
import { timingSafeEqual } from "node:crypto";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  addToCartMutation,
  createCartMutation,
  editCartItemsMutation,
  removeFromCartMutation,
  updateCartAttributesMutation,
} from "./mutations/cart";
import { getArticleQuery, getBlogArticlesQuery } from "./queries/blog";
import { getCartQuery } from "./queries/cart";
import {
  getCollectionProductsQuery,
  getCollectionQuery,
  getCollectionsQuery,
} from "./queries/collection";
import { getMenuQuery } from "./queries/menu";
import { getPageQuery, getPagesQuery } from "./queries/page";
import {
  getProductQuery,
  getProductRecommendationsQuery,
  getProductsQuery,
} from "./queries/product";
import {
  Article,
  ArticlesPage,
  Cart,
  Collection,
  Connection,
  Image,
  Menu,
  Page,
  PageInfo,
  Product,
  ProductsPage,
  ShopifyAddToCartOperation,
  ShopifyArticleOperation,
  ShopifyBlogArticlesOperation,
  ShopifyCart,
  ShopifyCartOperation,
  ShopifyCollection,
  ShopifyCollectionOperation,
  ShopifyCollectionProductsOperation,
  ShopifyCollectionsOperation,
  ShopifyCreateCartOperation,
  ShopifyMenuOperation,
  ShopifyPageOperation,
  ShopifyPagesOperation,
  ShopifyProduct,
  ShopifyProductOperation,
  ShopifyProductRecommendationsOperation,
  ShopifyProductsOperation,
  ShopifyRemoveFromCartOperation,
  ShopifyUpdateCartAttributesOperation,
  ShopifyUpdateCartOperation,
} from "./types";

const domain = process.env.SHOPIFY_STORE_DOMAIN
  ? ensureStartsWith(process.env.SHOPIFY_STORE_DOMAIN, "https://")
  : "";
const endpoint = domain ? `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}` : "";
const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

export async function shopifyFetch<T>({
  headers,
  query,
  variables,
}: {
  headers?: HeadersInit;
  query: string;
  variables?: ExtractVariables<T>;
}): Promise<{ status: number; body: T } | never> {
  try {
    if (!endpoint) {
      throw new Error("SHOPIFY_STORE_DOMAIN environment variable is not set");
    }

    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": key,
        ...headers,
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables }),
      }),
    });

    const body = await result.json();

    if (body.errors) {
      throw body.errors[0];
    }

    return {
      status: result.status,
      body,
    };
  } catch (e) {
    if (isShopifyError(e)) {
      throw {
        cause: e.cause?.toString() || "unknown",
        status: e.status || 500,
        message: e.message,
        query,
      };
    }

    throw {
      error: e,
      query,
    };
  }
}

export function filterProductsWithFeaturedImage(
  products: Product[],
): Product[] {
  return products.filter((p) => p.featuredImage?.url);
}

export function filterVisibleCollectionProducts(
  products: Product[],
): Product[] {
  return filterProductsWithFeaturedImage(
    products.filter((product) => !product.tags.includes(HIDDEN_PRODUCT_TAG)),
  );
}

function parseProductsConnection(connection: Connection<ShopifyProduct>): {
  products: Product[];
  pageInfo: PageInfo;
} {
  return {
    products: reshapeProducts(removeEdgesAndNodes(connection)),
    pageInfo: connection.pageInfo ?? {
      hasNextPage: false,
      endCursor: null,
    },
  };
}

const removeEdgesAndNodes = <T>(array: Connection<T>): T[] => {
  return array.edges.map((edge) => edge?.node);
};

const reshapeCart = (cart: ShopifyCart): Cart => {
  if (!cart.cost?.totalTaxAmount) {
    cart.cost.totalTaxAmount = {
      amount: "0.0",
      currencyCode: cart.cost.totalAmount.currencyCode,
    };
  }

  return {
    ...cart,
    checkoutUrl: toStoreCheckoutUrl(cart.checkoutUrl),
    lines: removeEdgesAndNodes(cart.lines),
  };
};

/** Keep Shopify's cart path and token; only the host comes from SHOPIFY_STORE_DOMAIN. */
function toStoreCheckoutUrl(checkoutUrl: string) {
  if (!checkoutUrl || !domain) return checkoutUrl;

  try {
    const url = new URL(checkoutUrl);
    url.host = new URL(domain).host;
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

const reshapeCollection = (
  collection: ShopifyCollection,
): Collection | undefined => {
  if (!collection) {
    return undefined;
  }

  return {
    ...collection,
    path: `/collections/${collection.handle}`,
  };
};

const reshapeCollections = (collections: ShopifyCollection[]) => {
  const reshapedCollections = [];

  for (const collection of collections) {
    if (collection) {
      const reshapedCollection = reshapeCollection(collection);

      if (reshapedCollection) {
        reshapedCollections.push(reshapedCollection);
      }
    }
  }

  return reshapedCollections;
};

const reshapeImages = (images: Connection<Image>, productTitle: string) => {
  const flattened = removeEdgesAndNodes(images);

  return flattened.map((image) => {
    const filename = image.url.match(/.*\/(.*)\..*/)?.[1];
    return {
      ...image,
      altText: image.altText || `${productTitle} - ${filename}`,
    };
  });
};

const reshapeSellingPlanGroups = (
  groups: ShopifyProduct["sellingPlanGroups"],
) => {
  if (!groups) {
    return [];
  }

  return removeEdgesAndNodes(groups).map((group) => ({
    name: group.name,
    sellingPlans: removeEdgesAndNodes(group.sellingPlans),
  }));
};

const reshapeProduct = (
  product: ShopifyProduct,
  filterHiddenProducts: boolean = true,
) => {
  if (
    !product ||
    (filterHiddenProducts && product.tags.includes(HIDDEN_PRODUCT_TAG))
  ) {
    return undefined;
  }

  const { images, variants, collections, sellingPlanGroups, ...rest } = product;

  return {
    ...rest,
    images: reshapeImages(images, product.title),
    variants: removeEdgesAndNodes(variants),
    collections: collections ? removeEdgesAndNodes(collections) : [],
    sellingPlanGroups: reshapeSellingPlanGroups(sellingPlanGroups),
  };
};

const reshapeProducts = (products: ShopifyProduct[]) => {
  const reshapedProducts = [];

  for (const product of products) {
    if (product) {
      const reshapedProduct = reshapeProduct(product);

      if (reshapedProduct) {
        reshapedProducts.push(reshapedProduct);
      }
    }
  }

  return reshapedProducts;
};

export async function createCart(): Promise<Cart> {
  const res = await shopifyFetch<ShopifyCreateCartOperation>({
    query: createCartMutation,
  });

  return reshapeCart(res.body.data.cartCreate.cart);
}

async function fetchCartById(cartId: string): Promise<Cart | undefined> {
  const res = await shopifyFetch<ShopifyCartOperation>({
    query: getCartQuery,
    variables: { cartId },
  });

  if (!res.body.data.cart) {
    return undefined;
  }

  return reshapeCart(res.body.data.cart);
}

/** Returns a valid cart, replacing the cookie when the stored cart was completed. */
export async function ensureActiveCart(): Promise<Cart> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;

  if (cartId) {
    const cart = await fetchCartById(cartId);
    if (cart) {
      return cart;
    }
    cookieStore.delete({ name: "cartId", path: "/" });
  }

  const cart = await createCart();
  cookieStore.set("cartId", cart.id!, cartCookieOptions);
  return cart;
}

export async function addToCart(
  lines: {
    merchandiseId: string;
    quantity: number;
    sellingPlanId?: string;
    attributes?: { key: string; value: string }[];
  }[],
): Promise<Cart> {
  const cart = await ensureActiveCart();
  const res = await shopifyFetch<ShopifyAddToCartOperation>({
    query: addToCartMutation,
    variables: {
      cartId: cart.id!,
      lines,
    },
  });
  return reshapeCart(res.body.data.cartLinesAdd.cart);
}

export async function updateCartAttributes(
  attributes: { key: string; value: string }[],
  cartId?: string,
): Promise<void> {
  const id = cartId ?? (await ensureActiveCart()).id;
  if (!id) {
    throw new Error("Could not reserve this time.");
  }

  const res = await shopifyFetch<ShopifyUpdateCartAttributesOperation>({
    query: updateCartAttributesMutation,
    variables: {
      cartId: id,
      attributes,
    },
  });
  const message = res.body.data.cartAttributesUpdate.userErrors[0]?.message;
  if (message) {
    throw new Error(message);
  }
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  const cart = await ensureActiveCart();
  const res = await shopifyFetch<ShopifyRemoveFromCartOperation>({
    query: removeFromCartMutation,
    variables: {
      cartId: cart.id!,
      lineIds,
    },
  });

  return reshapeCart(res.body.data.cartLinesRemove.cart);
}

export async function updateCart(
  lines: { id: string; merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  const cart = await ensureActiveCart();
  const res = await shopifyFetch<ShopifyUpdateCartOperation>({
    query: editCartItemsMutation,
    variables: {
      cartId: cart.id!,
      lines,
    },
  });

  return reshapeCart(res.body.data.cartLinesUpdate.cart);
}

export async function getCart(): Promise<Cart | undefined> {
  "use cache: private";
  cacheTag(TAGS.cart);
  cacheLife("seconds");

  const cartId = (await cookies()).get("cartId")?.value;

  if (!cartId) {
    return undefined;
  }

  const cart = await fetchCartById(cartId);

  // Completed checkouts return null — cookie is cleared in Server Actions
  // (ensureActiveCart, createCartAndSetCookie) where writes are allowed.
  if (!cart) {
    return undefined;
  }

  return cart;
}

export async function getCollection(
  handle: string,
): Promise<Collection | undefined> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  const res = await shopifyFetch<ShopifyCollectionOperation>({
    query: getCollectionQuery,
    variables: {
      handle,
    },
  });

  return reshapeCollection(res.body.data.collection);
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey,
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.collections, TAGS.products);
  cacheLife("days");

  if (!endpoint) {
    console.log(
      `Skipping getCollectionProducts for '${collection}' - Shopify not configured`,
    );
    return [];
  }

  const res = await shopifyFetch<ShopifyCollectionProductsOperation>({
    query: getCollectionProductsQuery,
    variables: {
      handle: collection,
      reverse,
      sortKey: sortKey === "CREATED_AT" ? "CREATED" : sortKey,
      first: 100,
    },
  });

  if (!res.body.data.collection) {
    console.log(`No collection found for \`${collection}\``);
    return [];
  }

  return reshapeProducts(
    removeEdgesAndNodes(res.body.data.collection.products),
  );
}

export async function getCollectionProductsPage({
  collection,
  reverse,
  sortKey,
  first = COLLECTION_PRODUCTS_PAGE_SIZE,
  after,
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
  first?: number;
  after?: string | null;
}): Promise<ProductsPage | null> {
  if (!endpoint) {
    return null;
  }

  const res = await shopifyFetch<ShopifyCollectionProductsOperation>({
    query: getCollectionProductsQuery,
    variables: {
      handle: collection,
      reverse,
      sortKey: sortKey === "CREATED_AT" ? "CREATED" : sortKey,
      first,
      after: after ?? undefined,
    },
  });

  if (!res.body.data.collection) {
    return null;
  }

  const { products, pageInfo } = parseProductsConnection(
    res.body.data.collection.products,
  );

  return {
    products: filterVisibleCollectionProducts(products),
    pageInfo,
  };
}

export async function getProductsPage({
  query,
  reverse,
  sortKey,
  first = COLLECTION_PRODUCTS_PAGE_SIZE,
  after,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
  first?: number;
  after?: string | null;
}): Promise<ProductsPage | null> {
  if (!endpoint) {
    return null;
  }

  const res = await shopifyFetch<ShopifyProductsOperation>({
    query: getProductsQuery,
    variables: {
      query,
      reverse,
      sortKey,
      first,
      after: after ?? undefined,
    },
  });

  const { products, pageInfo } = parseProductsConnection(
    res.body.data.products,
  );

  return {
    products: filterVisibleCollectionProducts(products),
    pageInfo,
  };
}

export async function loadCollectionProductsPage({
  collection,
  cursor,
  first = COLLECTION_PRODUCTS_PAGE_SIZE,
}: {
  collection: string;
  cursor?: string | null;
  first?: number;
}): Promise<ProductsPage> {
  const sortKey = "CREATED_AT";
  const reverse = true;

  if (collection !== "all") {
    const collectionPage = await getCollectionProductsPage({
      collection,
      sortKey,
      reverse,
      first,
      after: cursor,
    });

    if (collectionPage) {
      return collectionPage;
    }
  }

  const productsPage = await getProductsPage({
    sortKey,
    reverse,
    first,
    after: cursor,
  });

  return (
    productsPage ?? {
      products: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    }
  );
}

export async function getCollections(): Promise<Collection[]> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  if (!endpoint) {
    console.log("Skipping getCollections - Shopify not configured");
    return [
      {
        handle: "",
        title: "All",
        description: "All products",
        seo: {
          title: "All",
          description: "All products",
        },
        path: "/search",
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  const res = await shopifyFetch<ShopifyCollectionsOperation>({
    query: getCollectionsQuery,
  });
  const shopifyCollections = removeEdgesAndNodes(res.body?.data?.collections);
  const collections = [
    {
      handle: "",
      title: "All",
      description: "All products",
      seo: {
        title: "All",
        description: "All products",
      },
      path: "/search",
      updatedAt: new Date().toISOString(),
    },
    // Filter out the `hidden` collections.
    // Collections that start with `hidden-*` need to be hidden on the search page.
    ...reshapeCollections(shopifyCollections).filter(
      (collection) => !collection.handle.startsWith("hidden"),
    ),
  ];

  return collections;
}

export async function getMenu(handle: string): Promise<Menu[]> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  if (!endpoint) {
    console.log(`Skipping getMenu for '${handle}' - Shopify not configured`);
    return [];
  }

  const res = await shopifyFetch<ShopifyMenuOperation>({
    query: getMenuQuery,
    variables: {
      handle,
    },
  });

  return (
    res.body?.data?.menu?.items.map((item: { title: string; url: string }) => ({
      title: item.title,
      path: item.url
        .replace(domain, "")
        .replace("/collections", "/search")
        .replace("/pages", ""),
    })) || []
  );
}

export async function getPage(handle: string): Promise<Page> {
  const res = await shopifyFetch<ShopifyPageOperation>({
    query: getPageQuery,
    variables: { handle },
  });

  return res.body.data.pageByHandle;
}

export async function getPages(): Promise<Page[]> {
  const res = await shopifyFetch<ShopifyPagesOperation>({
    query: getPagesQuery,
  });

  return removeEdgesAndNodes(res.body.data.pages);
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  if (!endpoint) {
    console.log(`Skipping getProduct for '${handle}' - Shopify not configured`);
    return undefined;
  }

  const res = await shopifyFetch<ShopifyProductOperation>({
    query: getProductQuery,
    variables: {
      handle,
    },
  });

  return reshapeProduct(res.body.data.product, false);
}

export async function getProductRecommendations(
  productId: string,
): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  const res = await shopifyFetch<ShopifyProductRecommendationsOperation>({
    query: getProductRecommendationsQuery,
    variables: {
      productId,
    },
  });

  return reshapeProducts(res.body.data.productRecommendations);
}

export async function getProducts({
  query,
  reverse,
  sortKey,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  const res = await shopifyFetch<ShopifyProductsOperation>({
    query: getProductsQuery,
    variables: {
      query,
      reverse,
      sortKey,
      first: 100,
    },
  });

  return reshapeProducts(removeEdgesAndNodes(res.body.data.products));
}

export async function getBlogArticlesPage({
  blogHandle,
  first = 24,
  after,
}: {
  blogHandle: string;
  first?: number;
  after?: string | null;
}): Promise<ArticlesPage | null> {
  if (!endpoint) {
    return null;
  }

  const res = await shopifyFetch<ShopifyBlogArticlesOperation>({
    query: getBlogArticlesQuery,
    variables: {
      blogHandle,
      first,
      after: after ?? undefined,
    },
  });

  const blog = res.body.data.blog;
  if (!blog) {
    return null;
  }

  const articles = removeEdgesAndNodes(blog.articles).filter(
    (article): article is Article => Boolean(article?.image?.url),
  );

  return {
    articles,
    pageInfo: blog.articles.pageInfo ?? {
      hasNextPage: false,
      endCursor: null,
    },
  };
}

export async function getArticle({
  blogHandle,
  articleHandle,
}: {
  blogHandle: string;
  articleHandle: string;
}): Promise<Article | null> {
  if (!endpoint) {
    return null;
  }

  const res = await shopifyFetch<ShopifyArticleOperation>({
    query: getArticleQuery,
    variables: { blogHandle, articleHandle },
  });

  return res.body.data.blog?.articleByHandle ?? null;
}

function revalidationSecretMatches(provided: string | null): boolean {
  const expected = process.env.SHOPIFY_REVALIDATION_SECRET;
  if (!provided || !expected) return false;

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

// This is called from `app/api/revalidate.ts` so providers can control revalidation logic.
export async function revalidate(req: NextRequest): Promise<NextResponse> {
  // We always need to respond with a 200 status code to Shopify,
  // otherwise it will continue to retry the request.
  const collectionWebhooks = [
    "collections/create",
    "collections/delete",
    "collections/update",
  ];
  const productWebhooks = [
    "products/create",
    "products/delete",
    "products/update",
  ];
  const topic = (await headers()).get("x-shopify-topic") || "unknown";
  const secret =
    req.nextUrl.searchParams.get("secret") ||
    req.headers.get("x-shopify-revalidation-secret");
  const isCollectionUpdate = collectionWebhooks.includes(topic);
  const isProductUpdate = productWebhooks.includes(topic);

  if (!revalidationSecretMatches(secret)) {
    console.error("Invalid revalidation secret.");
    return NextResponse.json({ status: 401 }, { status: 401 });
  }

  if (!isCollectionUpdate && !isProductUpdate) {
    // We don't need to revalidate anything for any other topics.
    return NextResponse.json({ status: 200 });
  }

  if (isCollectionUpdate) {
    revalidateTag(TAGS.collections, "seconds");
  }

  if (isProductUpdate) {
    revalidateTag(TAGS.products, "seconds");
  }

  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}
