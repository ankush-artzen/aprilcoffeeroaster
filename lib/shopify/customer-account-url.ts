/** Absolute URL on SHOPIFY_STORE_DOMAIN. Server-only: the env var is not public. */
export function getShopifyShopUrl(pathname: string): string {
  const raw = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  if (!raw) {
    throw new Error("SHOPIFY_STORE_DOMAIN is not set");
  }

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const url = new URL(withProtocol);
  url.pathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
  url.search = "";
  url.hash = "";
  return url.toString();
}

/** Shopify-hosted customer account (orders and subscriptions). No Next.js auth. */
export function getShopifyCustomerAccountUrl(): string {
  return getShopifyShopUrl("/account");
}
