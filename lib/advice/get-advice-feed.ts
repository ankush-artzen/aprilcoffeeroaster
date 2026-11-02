import type { AdviceFeedResponse } from "lib/advice/advice-types";
import { fetchShopifyAdviceFeed } from "lib/advice/shopify-advice";
import {
  fetchDatoAdviceFeed,
  isDatoCmsConfigured,
} from "lib/cms/aprilcoffee-advice";
import { headers } from "next/headers";

export async function getAdviceFeed(
  cursor?: string | null,
): Promise<AdviceFeedResponse> {
  if (isDatoCmsConfigured()) {
    try {
      return await fetchDatoAdviceFeed({ cursor });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "DatoCMS advice feed failed, falling back to Shopify:",
          error,
        );
      }
    }
  }

  try {
    const headersList = await headers();
    const host = headersList.get("host") ?? "localhost:3000";
    const protocol =
      headersList.get("x-forwarded-proto") ??
      (process.env.NODE_ENV === "production" ? "https" : "http");

    const url = new URL(`${protocol}://${host}/api/projects`);
    if (cursor) url.searchParams.set("cursor", cursor);

    const res = await fetch(url, { next: { revalidate: 300 } });

    if (res.ok) {
      return res.json() as Promise<AdviceFeedResponse>;
    }
  } catch {
    console.error("Failed to fetch advice feed from Shopify");  
  }

  return fetchShopifyAdviceFeed({ cursor });
}

