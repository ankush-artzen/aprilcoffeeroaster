"use client";

import { updateItemQuantity } from "components/cart/actions";
import { useCart } from "components/cart/cart-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const quantityButtonClass =
  "btn-brand flex size-7 shrink-0 cursor-pointer items-center justify-center border-[2pt] text-sm font-bold uppercase disabled:cursor-not-allowed disabled:opacity-50 max-md:size-8";

export default function CartLineQuantity({
  merchandiseId,
  quantity,
}: {
  merchandiseId: string;
  quantity: number;
}) {
  const router = useRouter();
  const { setCartItemQuantity } = useCart();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(String(quantity));

  useEffect(() => {
    setValue(String(quantity));
  }, [quantity]);

  const applyQuantity = (newQuantity: number) => {
    if (newQuantity === quantity || isPending) return;

    startTransition(async () => {
      setCartItemQuantity(merchandiseId, newQuantity);
      await updateItemQuantity(null, { merchandiseId, quantity: newQuantity });
      router.refresh();
    });
  };

  const handleInputBlur = () => {
    const parsed = parseInt(value, 10);

    if (Number.isNaN(parsed) || parsed < 1) {
      setValue(String(quantity));
      return;
    }

    applyQuantity(parsed);
  };

  return (
    <div aria-label="quantity-controls" className="mt-2 inline-flex items-center">
      <button
        type="button"
        aria-label="decrease-quantity"
        disabled={isPending || quantity <= 1}
        className={quantityButtonClass}
        onClick={() => applyQuantity(quantity - 1)}
      >
        −
      </button>
      <input
        aria-label="quantity-input"
        type="number"
        min={1}
        inputMode="numeric"
        disabled={isPending}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={handleInputBlur}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        className="h-7 w-10 border-y-[2pt] border-black bg-white text-center text-sm font-bold [appearance:textfield] focus:outline-none disabled:opacity-50 max-md:h-8 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label="increase-quantity"
        disabled={isPending}
        className={quantityButtonClass}
        onClick={() => applyQuantity(quantity + 1)}
      >
        +
      </button>
    </div>
  );
}
