import {
    fetchDatoAdviceFeed,
    isDatoCmsConfigured,
} from "lib/cms/aprilcoffee-advice";
import { fetchShopifyAdviceFeed } from "lib/advice/shopify-advice";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    if (isDatoCmsConfigured()) {
      try {
        const cursor = req.nextUrl.searchParams.get("cursor");
        const data = await fetchDatoAdviceFeed({ cursor });
        return NextResponse.json(data);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "DatoCMS advice API failed, falling back to Shopify:",
            error,
          );
        }
      }
    }

    const cursor = req.nextUrl.searchParams.get("cursor");
    const data = await fetchShopifyAdviceFeed({ cursor });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch advice feed" },
      { status: 502 },
    );
  }
}
