import CartPageClient from "components/store/collections/cart-page-client";
import { getShopifyShopUrl } from "lib/shopify/customer-account-url";

export const metadata = {
  title: "Cart",
};

export default async function CartPage() {
  return (
    <CartPageClient
      termsUrl={getShopifyShopUrl("/policies/terms-of-service")}
    />
  );
}
