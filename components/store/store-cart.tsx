"use client";

import { useCart } from "components/cart/cart-context";
import Price from "components/price";
import Link from "next/link";

function formatItemCount(quantity: number) {
  if (quantity === 0) return "0 Items";
  if (quantity === 1) return "1 Item";
  return `${quantity} Items`;
}

export default function StoreCart() {
  const { cart } = useCart();

  const quantity = cart?.totalQuantity ?? 0;
  const totalAmount = cart?.cost?.totalAmount;

  if (quantity === 0) return null;

  return (
    <>
      {/* DESKTOP CART */}

      <div
        aria-label="cart"
        className="
    ml-2
    w-[min-w-[120px] w-fit max-w-[180px]]
    select-none
    text-[11px]
    leading-[15px]
    font-[400]
    uppercase

    max-md:hidden
    md:block
  "
      >
        <Link
          href="/cart"
          aria-label="cart-heading"
          className="
      block
      w-full
      bg-black
      py-1
      sm:py-[0px]
      text-center
      uppercase
      text-white
      leading-[15px]
      no-underline
    "
        >
          Cart
        </Link>

        <div
          id="cart-footer"
          className="
      flex
      w-full
      items-center
      justify-between
      border
      border-black
      px-[10px]
      py-[2px]
      text-left
      uppercase
    "
        >
          <span
            aria-label="cart-count"
            id="cart-count"
            className="whitespace-nowrap"
          >
            {formatItemCount(quantity)}
          </span>

          {totalAmount ? (
            <span
              aria-label="cart-amount"
              className="ml-2 inline-block whitespace-nowrap"
            >
              <Price
                amount={totalAmount.amount}
                currencyCode={totalAmount.currencyCode}
                className="
            inline
            text-[11px]
            leading-[15px]
            font-[400]
          "
                currencyCodeClassName="hidden"
              />
            </span>
          ) : null}
        </div>
      </div>
      {/* MOBILE CART */}
      <Link
        href="/cart"
        aria-label="mobile-cart-heading"
        className="
          ml-px
          pt-0.5
          text-sm
          uppercase
          text-white

          md:invisible
          md:hidden
        "
      >
        <span
          aria-label="cart-label"
          className="
            border-2
            border-x-8
            border-black
            bg-black
          "
        >
          Cart
        </span>

        <span
          aria-label="cart-count"
          className="
            ml-px
            border-2
            border-x-8
            border-black
            bg-black
          "
        >
          {quantity}
        </span>
      </Link>
    </>
  );
}
