"use client";

import { removeCartLine } from "components/cart/actions";
import { useCart } from "components/cart/cart-context";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const removeButtonClass =
  "btn-brand flex items-center justify-center whitespace-nowrap border-[2pt] px-4 text-center cursor-pointer text-sm font-bold uppercase max-md:my-1 max-md:h-8 max-md:py-1 max-md:h-5! max-md:w-14! max-md:text-sm";

export default function CartLineRemoveButton({
  lineId,
  merchandiseId,
}: {
  lineId: string;
  merchandiseId: string;
}) {
  const router = useRouter();
  const { updateCartItem } = useCart();
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          updateCartItem(merchandiseId, "delete", lineId);
          await removeCartLine(lineId);
          router.refresh();
        });
      }}
    >
      <button
        type="submit"
        disabled={isPending}
        className={removeButtonClass}
        aria-label="remove-btn"
      >
        {isPending ? "…" : "Remove"}
      </button>
    </form>
  );
}
