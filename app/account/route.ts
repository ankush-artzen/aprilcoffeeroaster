import { getShopifyCustomerAccountUrl } from "lib/shopify/customer-account-url";
import { connection, NextResponse } from "next/server";

/** Sends the customer to the Shopify account UI on SHOPIFY_SHOP_DOMAIN. */
export async function GET() {
  await connection();

  try {
    return NextResponse.redirect(getShopifyCustomerAccountUrl(), 307);
  } catch {
    return NextResponse.json(
      { error: "SHOPIFY_STORE_DOMAIN is not configured" },
      { status: 500 },
    );
  }
}
