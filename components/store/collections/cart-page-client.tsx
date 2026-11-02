"use client";

import { useCart } from "components/cart/cart-context";
import CartLineQuantity from "components/store/collections/cart-line-quantity";
import CartLineRemoveButton from "components/store/collections/cart-line-remove-button";
import CategoryNav from "components/store/collections/category-nav";
import Footer from "components/store/layout/footer";
import Logo from "components/store/logo/logo";
import { DEFAULT_OPTION } from "lib/constants";
import { formatCartMoney } from "lib/format/format-cart-money";
import type { CartItem } from "lib/shopify/types";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function CartLineRow({ line }: { line: CartItem }) {
  const variantLabel =
    line.merchandise.title === DEFAULT_OPTION ? "" : line.merchandise.title;
  const deliveryFrequency =
    line.sellingPlanAllocation?.sellingPlan.name ??
    line.attributes?.find((attribute) => attribute.key === "Delivery frequency")
      ?.value;
  const appointmentDate = line.attributes?.find(
    (attribute) => attribute.key === "Date",
  )?.value;
  const appointmentTime = line.attributes?.find(
    (attribute) => attribute.key === "Time",
  )?.value;
  const isAppointment = Boolean(appointmentDate);
  const lineTotal = formatCartMoney(
    line.cost.totalAmount.amount,
    line.cost.totalAmount.currencyCode,
  );
  const unitAmount =
    line.quantity > 0
      ? formatCartMoney(
          (parseFloat(line.cost.totalAmount.amount) / line.quantity).toString(),
          line.cost.totalAmount.currencyCode,
        )
      : lineTotal;
  const image = line.merchandise.product.featuredImage;

  return (
    <div
      aria-label={line.merchandise.product.handle}
      className="flex border-b uppercase max-md:min-h-28 max-md:pb-3"
    >
      <div className="w-1/5 max-md:w-[32%]">
        <Link href={`/product/${line.merchandise.product.handle}`}>
          {image?.url ? (
            <Image
              alt={line.merchandise.product.title}
              src={image.url}
              width={120}
              height={120}
              unoptimized
              sizes="(min-width: 45em) 50vw, 100vw"
              className="w-full"
              style={{ aspectRatio: "1 / 1" }}
            />
          ) : null}
        </Link>
      </div>

      <div className="mt-2 w-[55%]">
        <div className="ml-2 text-left">
          <Link
            href={`/product/${line.merchandise.product.handle}`}
            className="m-0 whitespace-pre-wrap text-sm font-bold no-underline max-md:w-full max-md:whitespace-pre-wrap"
          >
            {line.merchandise.product.title}
          </Link>
          <div aria-label="price" className="text-sm">
            <div className="text-[0.85em]">
              {variantLabel ? <div>{variantLabel}</div> : null}
              {deliveryFrequency ? <div>{deliveryFrequency}</div> : null}
              {appointmentDate ? <div>{appointmentDate}</div> : null}
              {appointmentTime ? <div>{appointmentTime}</div> : null}
              <div className="flex space-x-1">
                <div>{unitAmount}</div>
              </div>
              {isAppointment ? (
                <div>Qty {line.quantity}</div>
              ) : (
                <CartLineQuantity
                  merchandiseId={line.merchandise.id}
                  quantity={line.quantity}
                />
              )}
            </div>
            <div
              aria-label="delete-button"
              className="mt-2 md:invisible md:hidden lg:invisible lg:hidden"
            >
              {line.id ? (
                <CartLineRemoveButton
                  lineId={line.id}
                  merchandiseId={line.merchandise.id}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex w-1/4 max-md:w-[18%]">
        <div className="text-sm max-md:invisible max-md:hidden">
          {line.id ? (
            <CartLineRemoveButton
              lineId={line.id}
              merchandiseId={line.merchandise.id}
            />
          ) : null}
        </div>
        <div className="w-full text-right text-sm">
          <div>{lineTotal}</div>
        </div>
      </div>
    </div>
  );
}

export default function CartPageClient({ termsUrl }: { termsUrl: string }) {
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const lines = cart?.lines ?? [];
  const subtotal = cart?.cost?.subtotalAmount ?? cart?.cost?.totalAmount;

  return (
    <>
      <Logo onMenuOpenChange={setMenuOpen} />

      <div className="mx-auto w-full max-w-352 min-h-0">
        <CategoryNav menuOpen={menuOpen} />

        <main
          role="main"
          id="mainContent"
          className="sm:mt-3 mt-5 h-[calc(100vh-130px)] min-h-0 w-9/12 overflow-y-auto max-md:h-auto max-md:overflow-y-visible max-md:float-none max-md:mt-0 max-md:w-full  max-md:-translate-x-0 ease-out duration-300"
        >
          <div
            id="cart-view"
            className="mx-auto mt-5 w-full max-w-150 max-md:h-full max-md:px-2.5"
          >
            {lines.length === 0 ? (
              <p className="py-16 text-center text-sm font-bold uppercase">
                Your cart is empty.{" "}
                <Link
                  href="/collections/all"
                  className="underline hover:no-underline"
                >
                  Continue shopping
                </Link>
              </p>
            ) : (
              <>
                {lines.map((line) => (
                  <CartLineRow
                    key={
                      line.id ??
                      `${line.merchandise.id}-${
                        line.attributes?.find(
                          (attribute) => attribute.key === "_ID",
                        )?.value ??
                        line.sellingPlanAllocation?.sellingPlan.id ??
                        line.attributes?.find(
                          (attribute) => attribute.key === "Delivery frequency",
                        )?.value ??
                        ""
                      }`
                    }
                    line={line}
                  />
                ))}

                <div className="mt-4 text-center text-sm font-bold uppercase max-md:mt-3">
                  {subtotal ? (
                    <div aria-label="cart-subtotal" className="mb-3.5">
                      Subtotal
                      <span className="ml-1 inline-block">
                        <div>
                          {formatCartMoney(
                            subtotal.amount,
                            subtotal.currencyCode,
                          )}
                        </div>
                      </span>
                    </div>
                  ) : null}

                  <div className="pb-4">
                    <div className="flex justify-center">
                      <div className="relative flex gap-2">
                        <input
                          aria-label="terms-checkbox"
                          id="terms-checkbox"
                          type="checkbox"
                          required
                          checked={termsAccepted}
                          onChange={(event) =>
                            setTermsAccepted(event.target.checked)
                          }
                          className="peer relative mt-px size-4 shrink-0 cursor-pointer appearance-none rounded-none border-2 bg-white align-sub checked:border-0 checked:bg-black"
                        />
                        <label
                          htmlFor="terms-checkbox"
                          className="select-none uppercase"
                        >
                          I agree to the{" "}
                          <a
                            className="underline"
                            aria-label="terms-and-conditions"
                            href={termsUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Terms and Conditions
                          </a>
                        </label>
                        <svg
                          className="pointer-events-none absolute left-0 top-0.5 hidden size-4 text-white peer-checked:block"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={4}
                          strokeLinecap="square"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <a
                    href={termsAccepted ? cart?.checkoutUrl : undefined}
                    aria-label="checkout-btn-link"
                    className={termsAccepted ? "" : "pointer-events-none"}
                    tabIndex={termsAccepted ? 0 : -1}
                  >
                    <button
                      type="button"
                      disabled={!termsAccepted}
                      className="btn-brand mx-auto mb-[18px] inline-block cursor-pointer items-center justify-center whitespace-nowrap border-[2pt] px-4 text-center text-sm font-bold uppercase max-md:my-1 max-md:h-8 max-md:py-1 max-md:text-base text-base! disabled:cursor-not-allowed max-md:mb-[18px] md:mb-[18px]"
                      aria-label="checkout-btn"
                    >
                      Checkout
                    </button>
                  </a>

                  {/* <div className="mt-1 leading-none text-gray-400">
                    Limited to 1 per size / item
                  </div> */}
                  <div className="text-gray-400">*Some exceptions apply</div>
                </div>
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
