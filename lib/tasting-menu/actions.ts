"use server";

import { TAGS } from "lib/constants";
import { addToCart, updateCartAttributes } from "lib/shopify";
import { getTastingMonth, holdTastingSlot } from "lib/tasting-menu/servicify";
import type { CartAttribute, TastingMonth } from "lib/tasting-menu/types";
import { updateTag } from "next/cache";

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (
    typeof error === "object" &&
    error &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return fallback;
}

export async function loadTastingMonth(
  variantId: string,
  month: string,
): Promise<TastingMonth> {
  return getTastingMonth(variantId, month);
}

export async function addTastingReservation(input: {
  variantId: string;
  productTitle: string;
  date: string;
  startTime: string;
  quantity: number;
  answers: Record<string, string>;
}): Promise<{
  error?: string;
  lineAttributes?: CartAttribute[];
  checkoutUrl?: string;
}> {
  try {
    const held = await holdTastingSlot(input);
    const cart = await addToCart([
      {
        merchandiseId: input.variantId,
        quantity: input.quantity,
        attributes: held.lineAttributes,
      },
    ]);
    await updateCartAttributes(held.cartAttributes, cart.id);
    updateTag(TAGS.cart);
    return {
      lineAttributes: held.lineAttributes,
      checkoutUrl: cart.checkoutUrl,
    };
  } catch (error) {
    return {
      error: errorMessage(error, "Could not reserve this time."),
    };
  }
}
