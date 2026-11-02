"use server";

import { cartCookieOptions } from "lib/cart-cookie";
import { TAGS } from "lib/constants";
import {
  addToCart,
  createCart,
  getCart,
  removeFromCart,
  updateCart,
} from "lib/shopify";
import type { SellingPlan } from "lib/shopify/types";
import { isShopifySellingPlanId } from "lib/store/subscription-plans";
import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function addItem(
  prevState: any,
  selectedVariantId: string | undefined,
) {
  if (!selectedVariantId) {
    return "Error adding item to cart";
  }

  const result = await addVariantToCart(selectedVariantId, 1);
  return result.error ?? null;
}

export async function addVariantToCart(
  variantId: string,
  quantity: number = 1,
  sellingPlan?: SellingPlan,
): Promise<{ error?: string }> {
  if (!variantId) {
    return { error: "No variant selected" };
  }

  if (!Number.isFinite(quantity) || quantity < 1) {
    return { error: "Invalid quantity" };
  }

  try {
    await addToCart([
      {
        merchandiseId: variantId,
        quantity,
        ...(sellingPlan && isShopifySellingPlanId(sellingPlan.id)
          ? { sellingPlanId: sellingPlan.id }
          : {}),
        ...(sellingPlan
          ? {
              attributes: [
                { key: "Delivery frequency", value: sellingPlan.name },
              ],
            }
          : {}),
      },
    ]);
    updateTag(TAGS.cart);
    return {};
  } catch (e) {
    console.error(e);
    return { error: "Error adding item to cart" };
  }
}

export async function removeCartLine(
  lineId: string,
): Promise<{ error?: string }> {
  if (!lineId) {
    return { error: "Missing line id" };
  }

  try {
    await removeFromCart([lineId]);
    updateTag(TAGS.cart);
    return {};
  } catch (e) {
    console.error(e);
    return { error: "Error removing item" };
  }
}

export async function removeItem(prevState: any, merchandiseId: string) {
  try {
    const cart = await getCart();

    if (!cart) {
      return "Error fetching cart";
    }

    const lineItem = cart.lines.find(
      (line) => line.merchandise.id === merchandiseId,
    );

    if (lineItem && lineItem.id) {
      await removeFromCart([lineItem.id]);
      updateTag(TAGS.cart);
    } else {
      return "Item not found in cart";
    }
  } catch (e) {
    return "Error removing item from cart";
  }
}

export async function updateItemQuantity(
  prevState: any,
  payload: {
    merchandiseId: string;
    quantity: number;
  },
) {
  const { merchandiseId, quantity } = payload;

  try {
    const cart = await getCart();

    if (!cart) {
      return "Error fetching cart";
    }

    const lineItem = cart.lines.find(
      (line) => line.merchandise.id === merchandiseId,
    );

    if (lineItem && lineItem.id) {
      if (quantity === 0) {
        await removeFromCart([lineItem.id]);
      } else {
        await updateCart([
          {
            id: lineItem.id,
            merchandiseId,
            quantity,
          },
        ]);
      }
    } else if (quantity > 0) {
      // If the item doesn't exist in the cart and quantity > 0, add it
      await addToCart([{ merchandiseId, quantity }]);
    }

    updateTag(TAGS.cart);
  } catch (e) {
    console.error(e);
    return "Error updating item quantity";
  }
}

export async function redirectToCheckout() {
  const cart = await getCart();
  if (!cart?.checkoutUrl || cart.lines.length === 0) {
    (await cookies()).delete({ name: "cartId", path: "/" });
    updateTag(TAGS.cart);
    redirect("/cart");
  }
  redirect(cart.checkoutUrl);
}

export async function createCartAndSetCookie() {
  (await cookies()).delete({ name: "cartId", path: "/" });
  const cart = await createCart();
  (await cookies()).set("cartId", cart.id!, cartCookieOptions);
  updateTag(TAGS.cart);
}
