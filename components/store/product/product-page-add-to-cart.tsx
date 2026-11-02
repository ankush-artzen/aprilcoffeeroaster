"use client";

import { addVariantToCart } from "components/cart/actions";
import { useCart } from "components/cart/cart-context";
import type { Product, SellingPlan } from "lib/shopify/types";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function ProductPageAddToCart({
  product,
  selectedVariantId,
  variantLabel,
  quantity = 1,
  sellingPlan,
  className,
  onAdded,
}: {
  product: Product;
  selectedVariantId: string;
  variantLabel: string;
  quantity?: number;
  sellingPlan?: SellingPlan;
  className: string;
  onAdded?: () => void;
}) {
  const router = useRouter();
  const { addCartItem } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedVariant = product.variants.find(
    (variant) => variant.id === selectedVariantId,
  );

  const quantityToAdd = Math.max(1, Math.floor(quantity));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!selectedVariant || !product.availableForSale || quantityToAdd < 1) {
      return;
    }

    startTransition(async () => {
      addCartItem(selectedVariant, product, quantityToAdd, sellingPlan);

      const result = await addVariantToCart(
        selectedVariantId,
        quantityToAdd,
        sellingPlan,
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
      onAdded?.();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <button
        type="submit"
        disabled={
          !selectedVariant ||
          !product.availableForSale ||
          isPending ||
          quantityToAdd < 1
        }
        className={className}
        aria-label={
          quantityToAdd > 1
            ? `add-${variantLabel}-${quantityToAdd}-to-cart`
            : `add-${variantLabel}-to-cart`
        }
      >
        {isPending
          ? "Adding…"
          : product.availableForSale
            ? quantityToAdd > 1
              ? `Add ${quantityToAdd} to Cart`
              : "Add to Cart"
            : "Sold Out"}
      </button>
      {error ? (
        <p
          className="mt-1 text-xs font-bold uppercase text-red-600"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
