"use client";

import { useEffect, useState } from "react";

export default function ProductPageQuantityInput({
  quantity,
  setQuantity,
  max = 99,
}: {
  quantity: number;
  setQuantity: (next: number) => void;
  max?: number;
}) {
  const [value, setValue] = useState(String(quantity));

  useEffect(() => {
    setValue(String(quantity));
  }, [quantity]);

  const clamp = (next: number) => Math.min(max, Math.max(1, next));

  const applyQuantity = (next: number) => {
    const clamped = clamp(Math.floor(next));
    if (clamped === quantity) return;
    setQuantity(clamped);
  };

  const handleInputBlur = () => {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      setValue(String(quantity));
      return;
    }

    applyQuantity(parsed);
  };

  const quantityButtonClass =
    "btn-brand flex h-full w-5 shrink-0 cursor-pointer items-center justify-center border-[2pt] text-sm font-bold uppercase disabled:cursor-not-allowed disabled:opacity-50 max-md:w-8";

  return (
    <div
      aria-label="quantity-controls"
      className="inline-flex h-7 items-center max-md:h-8"
    >
      <button
        type="button"
        aria-label="decrease-quantity"
        disabled={quantity <= 1}
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
        value={value}
        disabled={false}
        onChange={(event) => {
          const nextValue = event.target.value;
          setValue(nextValue);

          const parsed = parseInt(nextValue, 10);
          if (Number.isNaN(parsed)) return;

          applyQuantity(parsed);
        }}
        onBlur={handleInputBlur}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        className="h-full w-12 border-y-[2pt] border-black bg-white text-center text-sm font-bold [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label="increase-quantity"
        disabled={quantity >= max}
        className={quantityButtonClass}
        onClick={() => applyQuantity(quantity + 1)}
      >
        +
      </button>
    </div>
  );
}
