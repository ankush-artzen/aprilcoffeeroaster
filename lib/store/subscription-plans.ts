import type { Money, Product, SellingPlan } from "lib/shopify/types";

const SUBSCRIPTION_COLLECTION = "coffee-subscriptions";

const SUBSCRIPTION_HANDLES = new Set([
  "coffee-subscription",
  "organic-subscription",
  "house-coffee-subscription",
]);

const MONTHLY_PLANS: SellingPlan[] = [
  {
    id: "fallback:monthly-1",
    name: "Monthly Subscription (Recharges Every 15th)",
  },
  {
    id: "fallback:monthly-3",
    name: "Monthly Subscription (Recharges Every 15th) (3 orders)",
  },
  {
    id: "fallback:monthly-6",
    name: "Monthly Subscription (Recharges Every 15th) (6 orders)",
  },
];

const PLANS_BY_HANDLE: Record<string, SellingPlan[]> = {
  "house-coffee-subscription": [
    {
      id: "fallback:house-monthly-1",
      name: "Monthly Subscription (Recharged Every 15th)",
    },
    {
      id: "fallback:house-monthly-3",
      name: "Monthly Subscription (Recharged Every 15th) (3 orders)",
    },
    {
      id: "fallback:house-monthly-6",
      name: "Monthly Subscription (Recharged Every 15th) (6 orders)",
    },
  ],
};

export function isShopifySellingPlanId(id: string) {
  return id.startsWith("gid://shopify/SellingPlan/");
}

export function getSubscriptionGroupName(product: Product) {
  return (
    product.sellingPlanGroups?.find((group) => group.sellingPlans.length > 0)
      ?.name || "Subscribe and save"
  );
}

export function getSubscriptionPlans(product: Product): SellingPlan[] {
  const fromShopify =
    product.sellingPlanGroups?.flatMap((group) => group.sellingPlans) ?? [];

  if (fromShopify.length > 0) {
    return fromShopify;
  }

  const inSubscriptionCollection = product.collections?.some(
    (collection) => collection.handle === SUBSCRIPTION_COLLECTION,
  );

  if (!inSubscriptionCollection && !SUBSCRIPTION_HANDLES.has(product.handle)) {
    return [];
  }

  return PLANS_BY_HANDLE[product.handle] ?? MONTHLY_PLANS;
}

export function formatDeliveryPrice(price: Money) {
  const formatted = new Intl.NumberFormat("da-DK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(price.amount));

  return price.currencyCode === "DKK" ? `${formatted} kr` : formatted;
}
