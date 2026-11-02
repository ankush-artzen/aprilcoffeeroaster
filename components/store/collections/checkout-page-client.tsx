// "use client";

// import { useCart } from "components/cart/cart-context";
// import { TriFergSvg } from "components/store/tri-ferg-svg";
// import { DEFAULT_OPTION } from "lib/constants";
// import { formatCartMoney } from "lib/format/format-cart-money";
// import type { CartItem } from "lib/shopify/types";
// import Image from "next/image";
// import Link from "next/link";
// import { useMemo, useState } from "react";

// const SHIPPING_COUNTRIES = [
//   { code: "GG", label: "Guernsey" },
//   { code: "IM", label: "Isle of Man" },
//   { code: "JE", label: "Jersey" },
//   { code: "PH", label: "Philippines" },
//   { code: "KR", label: "South Korea" },
//   { code: "GB", label: "United Kingdom" },
// ] as const;

// const inputClass =
//   "w-full border border-neutral-300 bg-white px-3 py-3 text-sm outline-none focus:border-neutral-500";

// function CheckoutHeader() {
//   const marks = [
//     { id: "grey", fillClass: "fill-tri-ferg-grey" },
//     { id: "red", fillClass: "fill-tri-ferg-red" },
//     { id: "blue", fillClass: "fill-tri-ferg-blue" },
//   ] as const;

//   return (
//     <header className="border-b border-neutral-200 bg-[#f5f5f5] py-6">
//       <Link
//         href="/"
//         aria-label="Palace Skateboards home"
//         className="mx-auto flex w-fit items-center justify-center gap-3"
//       >
//         {marks.map((mark) => (
//           <span
//             key={mark.id}
//             className={`inline-block w-20 ${mark.fillClass}`}
//             aria-hidden
//           >
//             <TriFergSvg />
//           </span>
//         ))}
//       </Link>
//     </header>
//   );
// }

// function OrDivider() {
//   return (
//     <div className="my-6 flex items-center gap-4">
//       <span className="h-px flex-1 bg-neutral-300" />
//       <span className="text-xs font-medium uppercase text-neutral-600">Or</span>
//       <span className="h-px flex-1 bg-neutral-300" />
//     </div>
//   );
// }

// function SectionTitle({ children }: { children: string }) {
//   return (
//     <h2 className="mb-4 text-base font-bold uppercase tracking-wide">
//       {children}
//     </h2>
//   );
// }

// function OrderLineRow({ line }: { line: CartItem }) {
//   const image = line.merchandise.product.featuredImage;
//   const variant =
//     line.merchandise.title === DEFAULT_OPTION
//       ? null
//       : line.merchandise.title;
//   const price = formatCartMoney(
//     line.cost.totalAmount.amount,
//     line.cost.totalAmount.currencyCode,
//   );

//   return (
//     <div className="grid grid-cols-[64px_1fr_auto] items-start gap-3 py-3">
//       <div className="relative size-16 shrink-0 bg-neutral-100">
//         {image?.url ? (
//           <Image
//             src={image.url}
//             alt={line.merchandise.product.title}
//             width={64}
//             height={64}
//             unoptimized
//             className="size-full object-contain"
//           />
//         ) : null}
//         <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-neutral-700 text-[10px] font-medium text-white">
//           {line.quantity}
//         </span>
//       </div>
//       <div className="min-w-0 pt-0.5">
//         <p className="text-sm font-medium uppercase leading-snug">
//           {line.merchandise.product.title}
//         </p>
//         {variant ? (
//           <p className="mt-0.5 text-sm uppercase text-neutral-600">{variant}</p>
//         ) : null}
//       </div>
//       <p className="pt-0.5 text-sm tabular-nums">{price}</p>
//     </div>
//   );
// }

// function OrderSummaryContent({
//   lines,
//   subtotal,
//   total,
//   tax,
//   currencyCode,
//   itemCount,
//   checkoutUrl,
//   showPayButton,
// }: {
//   lines: CartItem[];
//   subtotal: string;
//   total: string;
//   tax: string | null;
//   currencyCode: string;
//   itemCount: number;
//   checkoutUrl: string;
//   showPayButton?: boolean;
// }) {
//   return (
//     <>
//       <div className="relative max-h-[min(40vh,320px)] overflow-y-auto pr-1">
//         <ul className="divide-y divide-neutral-200">
//           {lines.map((line) => (
//             <li key={line.id ?? line.merchandise.id}>
//               <OrderLineRow line={line} />
//             </li>
//           ))}
//         </ul>
//         {lines.length > 3 ? (
//           <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-[#ebebeb] via-[#ebebeb]/90 to-transparent pb-2 pt-10">
//             <span className="bg-neutral-800 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-white">
//               Scroll for more items ↓
//             </span>
//           </div>
//         ) : null}
//       </div>

//       <div className="mt-4 space-y-2 border-t border-neutral-300 pt-4 text-sm">
//         <div className="flex justify-between gap-4 uppercase">
//           <span>Subtotal · {itemCount} items</span>
//           <span className="tabular-nums">{subtotal}</span>
//         </div>
//         <div className="flex justify-between gap-4 uppercase text-neutral-600">
//           <span>Shipping</span>
//           <span className="text-right text-xs sm:text-sm">
//             Enter shipping address
//           </span>
//         </div>
//         <div className="flex justify-between gap-4 pt-2 text-base font-bold uppercase">
//           <span>Total</span>
//           <span className="tabular-nums">
//             <span className="mr-1 text-sm font-normal">{currencyCode}</span>
//             {total}
//           </span>
//         </div>
//         {tax && parseFloat(tax) > 0 ? (
//           <p className="text-xs text-neutral-600">
//             Including {formatCartMoney(tax, currencyCode)} in taxes
//           </p>
//         ) : null}
//       </div>

//       {showPayButton ? (
//         <a
//           href={checkoutUrl}
//           className="mt-6 block w-full bg-black py-4 text-center text-sm font-bold uppercase text-white hover:bg-neutral-800"
//         >
//           Pay now
//         </a>
//       ) : null}
//     </>
//   );
// }

// function MobileOrderSummary(props: Parameters<typeof OrderSummaryContent>[0]) {
//   const [summaryOpen, setSummaryOpen] = useState(false);

//   return (
//     <div className="border-b border-neutral-200 bg-[#ebebeb] lg:hidden">
//       <button
//         type="button"
//         className="flex w-full items-center justify-between px-4 py-4 text-left"
//         onClick={() => setSummaryOpen((open) => !open)}
//         aria-expanded={summaryOpen}
//       >
//         <span className="text-sm font-medium uppercase">Order summary</span>
//         <span className="flex items-center gap-2">
//           <span className="text-sm font-bold tabular-nums">{props.total}</span>
//           <span className="text-neutral-500" aria-hidden>
//             {summaryOpen ? "▲" : "▼"}
//           </span>
//         </span>
//       </button>
//       {summaryOpen ? (
//         <div className="border-t border-neutral-200 px-4 pb-4">
//           <OrderSummaryContent {...props} />
//         </div>
//       ) : null}
//     </div>
//   );
// }

// export default function CheckoutPageClient() {
//   const { cart } = useCart();
//   const [country, setCountry] = useState("GB");
//   const [marketingOptIn, setMarketingOptIn] = useState(false);
//   const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
//   const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");

//   const lines = cart?.lines ?? [];
//   const checkoutUrl = cart?.checkoutUrl ?? "#";
//   const currencyCode =
//     cart?.cost.totalAmount.currencyCode ??
//     cart?.cost.subtotalAmount.currencyCode ??
//     "GBP";

//   const subtotalFormatted = useMemo(() => {
//     if (!cart?.cost.subtotalAmount) return "—";
//     return formatCartMoney(
//       cart.cost.subtotalAmount.amount,
//       cart.cost.subtotalAmount.currencyCode,
//     );
//   }, [cart?.cost.subtotalAmount]);

//   const totalFormatted = useMemo(() => {
//     if (!cart?.cost.totalAmount) return "—";
//     return formatCartMoney(
//       cart.cost.totalAmount.amount,
//       cart.cost.totalAmount.currencyCode,
//     );
//   }, [cart?.cost.totalAmount]);

//   const taxAmount = cart?.cost.totalTaxAmount?.amount ?? null;
//   const itemCount = cart?.totalQuantity ?? lines.length;

//   if (!cart || lines.length === 0) {
//     return null;
//   }

//   return (
//     <div className="min-h-dvh bg-[#f5f5f5] text-black">
//       <CheckoutHeader />

//       <MobileOrderSummary
//         lines={lines}
//         subtotal={subtotalFormatted}
//         total={totalFormatted}
//         tax={taxAmount}
//         currencyCode={currencyCode}
//         itemCount={itemCount}
//         checkoutUrl={checkoutUrl}
//       />

//       <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_480px]">
//         <main className="px-4 py-6 sm:px-8 lg:px-12 lg:py-10">
//           <h1 className="sr-only">Checkout</h1>

//           <section aria-label="Express checkout">
//             <p className="mb-3 text-center text-xs font-medium uppercase text-neutral-600">
//               Express checkout
//             </p>
//             <div className="grid grid-cols-2 gap-3">
//               <a
//                 href={checkoutUrl}
//                 className="flex h-12 items-center justify-center rounded-md bg-[#5a31f4] text-white"
//               >
//                 <span className="text-lg font-semibold tracking-tight">
//                   shop
//                 </span>
//               </a>
//               <a
//                 href={checkoutUrl}
//                 className="flex h-12 items-center justify-center rounded-md bg-[#ffc439]"
//               >
//                 <span className="text-lg font-bold text-[#003087]">PayPal</span>
//               </a>
//             </div>
//           </section>

//           <OrDivider />

//           <form
//             className="max-w-xl"
//             onSubmit={(event) => {
//               event.preventDefault();
//               window.location.href = checkoutUrl;
//             }}
//           >
//             <section aria-labelledby="checkout-contact">
//               <SectionTitle>Contact</SectionTitle>
//               <label htmlFor="checkout-email" className="sr-only">
//                 Email
//               </label>
//               <input
//                 id="checkout-email"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 placeholder="Email"
//                 required
//                 className={inputClass}
//               />
//               <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm uppercase">
//                 <input
//                   type="checkbox"
//                   checked={marketingOptIn}
//                   onChange={(event) => setMarketingOptIn(event.target.checked)}
//                   className="mt-0.5 size-4 shrink-0 border-neutral-400"
//                 />
//                 Email me with news and offers
//               </label>
//             </section>

//             <section className="mt-8" aria-labelledby="checkout-delivery">
//               <SectionTitle>Delivery</SectionTitle>
//               <label htmlFor="checkout-country" className="sr-only">
//                 Country/region
//               </label>
//               <select
//                 id="checkout-country"
//                 name="countryCode"
//                 value={country}
//                 onChange={(event) => setCountry(event.target.value)}
//                 className={inputClass}
//               >
//                 {SHIPPING_COUNTRIES.map((c) => (
//                   <option key={c.code} value={c.code}>
//                     {c.label}
//                   </option>
//                 ))}
//               </select>

//               <div className="mt-3 grid grid-cols-2 gap-3">
//                 <input
//                   name="firstName"
//                   placeholder="First name"
//                   autoComplete="given-name"
//                   required
//                   className={inputClass}
//                 />
//                 <input
//                   name="lastName"
//                   placeholder="Last name"
//                   autoComplete="family-name"
//                   required
//                   className={inputClass}
//                 />
//               </div>

//               <input
//                 name="address1"
//                 placeholder="Address"
//                 autoComplete="address-line1"
//                 required
//                 className={`${inputClass} mt-3`}
//               />
//               <input
//                 name="address2"
//                 placeholder="Apartment, suite, etc. (optional)"
//                 autoComplete="address-line2"
//                 className={`${inputClass} mt-3`}
//               />

//               <div className="mt-3 grid grid-cols-2 gap-3">
//                 <input
//                   name="city"
//                   placeholder="City"
//                   autoComplete="address-level2"
//                   required
//                   className={inputClass}
//                 />
//                 <input
//                   name="postalCode"
//                   placeholder="Postcode"
//                   autoComplete="postal-code"
//                   required
//                   className={inputClass}
//                 />
//               </div>

//               <div className="relative mt-3">
//                 <input
//                   name="phone"
//                   type="tel"
//                   placeholder="Phone"
//                   autoComplete="tel"
//                   required
//                   className={`${inputClass} pr-10`}
//                 />
//                 <span
//                   className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
//                   aria-hidden
//                 >
//                   ?
//                 </span>
//               </div>
//             </section>

//             <section className="mt-8" aria-labelledby="checkout-shipping">
//               <SectionTitle>Shipping method</SectionTitle>
//               <div className="border border-neutral-300 bg-neutral-100 px-4 py-4 text-sm text-neutral-600">
//                 Enter your shipping address to view available shipping methods.
//               </div>
//             </section>

//             <section className="mt-8" aria-labelledby="checkout-payment">
//               <SectionTitle>Payment</SectionTitle>
//               <p className="mb-4 text-sm text-neutral-600">
//                 All transactions are secure and encrypted.
//               </p>

//               <div className="overflow-hidden border border-neutral-300 bg-white">
//                 <label className="flex cursor-pointer items-center justify-between border-b border-neutral-300 px-4 py-3">
//                   <span className="flex items-center gap-3">
//                     <input
//                       type="radio"
//                       name="payment"
//                       checked={paymentMethod === "card"}
//                       onChange={() => setPaymentMethod("card")}
//                     />
//                     <span className="text-sm font-bold uppercase">
//                       Credit card
//                     </span>
//                   </span>
//                   <span className="flex gap-1" aria-hidden>
//                     <span className="text-[10px] font-bold">VISA</span>
//                     <span className="text-[10px] font-bold">MC</span>
//                     <span className="text-[10px] font-bold text-neutral-400">
//                       +5
//                     </span>
//                   </span>
//                 </label>

//                 {paymentMethod === "card" ? (
//                   <div className="space-y-3 bg-neutral-50 p-4">
//                     <input
//                       placeholder="Card number"
//                       autoComplete="cc-number"
//                       className={inputClass}
//                       readOnly
//                       onFocus={() => {
//                         window.location.href = checkoutUrl;
//                       }}
//                     />
//                     <div className="grid grid-cols-2 gap-3">
//                       <input
//                         placeholder="Expiration date (MM / YY)"
//                         autoComplete="cc-exp"
//                         className={inputClass}
//                         readOnly
//                         onFocus={() => {
//                           window.location.href = checkoutUrl;
//                         }}
//                       />
//                       <input
//                         placeholder="Security code"
//                         autoComplete="cc-csc"
//                         className={inputClass}
//                         readOnly
//                         onFocus={() => {
//                           window.location.href = checkoutUrl;
//                         }}
//                       />
//                     </div>
//                     <input
//                       placeholder="Name on card"
//                       autoComplete="cc-name"
//                       className={inputClass}
//                     />
//                     <label className="flex cursor-pointer items-center gap-2 text-sm uppercase">
//                       <input
//                         type="checkbox"
//                         checked={billingSameAsShipping}
//                         onChange={(event) =>
//                           setBillingSameAsShipping(event.target.checked)
//                         }
//                       />
//                       Use shipping address as billing address
//                     </label>
//                   </div>
//                 ) : null}

//                 <label className="flex cursor-pointer items-center justify-between px-4 py-3">
//                   <span className="flex items-center gap-3">
//                     <input
//                       type="radio"
//                       name="payment"
//                       checked={paymentMethod === "paypal"}
//                       onChange={() => setPaymentMethod("paypal")}
//                     />
//                     <span className="text-sm font-bold uppercase">PayPal</span>
//                   </span>
//                 </label>
//               </div>
//             </section>

//             <div className="mt-8 lg:hidden">
//               <button
//                 type="submit"
//                 className="w-full bg-black py-4 text-sm font-bold uppercase text-white hover:bg-neutral-800"
//               >
//                 Pay now
//               </button>
//             </div>
//           </form>
//         </main>

//         <aside className="hidden bg-[#ebebeb] lg:block lg:min-h-[calc(100dvh-88px)] lg:border-l lg:border-neutral-200">
//           <div className="sticky top-0 p-8">
//             <h2 className="sr-only">Order summary</h2>
//             <OrderSummaryContent
//               lines={lines}
//               subtotal={subtotalFormatted}
//               total={totalFormatted}
//               tax={taxAmount}
//               currencyCode={currencyCode}
//               itemCount={itemCount}
//               checkoutUrl={checkoutUrl}
//             />
//           </div>
//         </aside>
//       </div>

//       <footer className="border-t border-neutral-200 bg-[#f5f5f5] px-4 py-6 text-center text-xs uppercase text-neutral-600">
//         All rights reserved Palace Skateboards
//       </footer>
//     </div>
//   );
// }

"use client";

import { useCart } from "components/cart/cart-context";
import {
  TriFergSvg,
  triFergLogoFromMarkId,
} from "components/store/logo/landing-logos";
import { DEFAULT_OPTION } from "lib/constants";
import { formatCartMoney } from "lib/format/format-cart-money";
import type { CartItem } from "lib/shopify/types";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

const SHIPPING_COUNTRIES = [
  { code: "GG", label: "Guernsey" },
  { code: "IM", label: "Isle of Man" },
  { code: "JE", label: "Jersey" },
  { code: "PH", label: "Philippines" },
  { code: "KR", label: "South Korea" },
  { code: "GB", label: "United Kingdom" },
] as const;

const inputClass =
  "h-[48px] w-full border border-[#d7d7d7] bg-white px-4 text-[14px] outline-none focus:border-black";

function CheckoutHeader() {
  const marks = [{ id: "grey" }, { id: "red" }, { id: "blue" }] as const;

  return (
    <header className="border-b border-[#d7d7d7] bg-[#efefef] py-8">
      <Link
        href="/"
        aria-label="Palace Skateboards home"
        className="mx-auto flex w-fit items-center justify-center gap-3"
      >
        {marks.map((mark) => (
          <span key={mark.id} className="inline-block w-20" aria-hidden>
            <TriFergSvg logo={triFergLogoFromMarkId(mark.id)} />
          </span>
        ))}
      </Link>
    </header>
  );
}

function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-4">
      <span className="h-px flex-1 bg-[#d7d7d7]" />
      <span className="text-xs font-medium uppercase text-neutral-600">
        OR
      </span>
      <span className="h-px flex-1 bg-[#d7d7d7]" />
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-4 text-[18px] font-black uppercase">{children}</h2>
  );
}

function OrderLineRow({ line }: { line: CartItem }) {
  const image = line.merchandise.product.featuredImage;

  const variant =
    line.merchandise.title === DEFAULT_OPTION
      ? null
      : line.merchandise.title;

  const price = formatCartMoney(
    line.cost.totalAmount.amount,
    line.cost.totalAmount.currencyCode,
  );

  return (
    <div className="grid grid-cols-[72px_1fr_auto] items-start gap-4 py-4">
      <div className="relative h-[72px] w-[72px] shrink-0 border border-[#d7d7d7] bg-white">
        {image?.url ? (
          <Image
            src={image.url}
            alt={line.merchandise.product.title}
            width={72}
            height={72}
            unoptimized
            className="size-full object-cover"
          />
        ) : null}

        <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
          {line.quantity}
        </span>
      </div>

      <div className="min-w-0 pt-0.5">
        <p className="text-[14px] font-bold uppercase leading-[18px]">
          {line.merchandise.product.title}
        </p>

        {variant ? (
          <p className="mt-1 text-[13px] uppercase text-neutral-600">
            {variant}
          </p>
        ) : null}
      </div>

      <p className="pt-0.5 text-[14px] font-bold">{price}</p>
    </div>
  );
}

function OrderSummaryContent({
  lines,
  subtotal,
  total,
  tax,
  currencyCode,
  itemCount,
  checkoutUrl,
  showPayButton,
}: {
  lines: CartItem[];
  subtotal: string;
  total: string;
  tax: string | null;
  currencyCode: string;
  itemCount: number;
  checkoutUrl: string;
  showPayButton?: boolean;
}) {
  return (
    <>
      <div className="relative max-h-[380px] overflow-y-auto pr-1">
        <ul>
          {lines.map((line) => (
            <li key={line.id ?? line.merchandise.id}>
              <OrderLineRow line={line} />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 border-t border-[#d7d7d7] pt-6">
        <div className="mb-4 flex items-center justify-between text-[14px] uppercase">
          <span>Subtotal · {itemCount} items</span>

          <span className="font-bold">{subtotal}</span>
        </div>

        <div className="mb-6 flex items-center justify-between text-[14px] uppercase text-neutral-600">
          <span>Shipping</span>

          <span className="text-right">
            Enter shipping address
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-[20px] font-black uppercase">
              Total
            </h2>

            {tax && parseFloat(tax) > 0 ? (
              <p className="mt-1 text-[12px] text-neutral-600">
                Including{" "}
                {formatCartMoney(tax, currencyCode)} in taxes
              </p>
            ) : null}
          </div>

          <div className="text-right">
            <p className="text-[11px] uppercase text-neutral-600">
              {currencyCode}
            </p>

            <h2 className="text-[30px] font-black">
              {total}
            </h2>
          </div>
        </div>
      </div>

      {showPayButton ? (
        <a
          href={checkoutUrl}
          className="mt-6 block w-full bg-black py-[16px] text-center text-[14px] font-bold uppercase text-white"
        >
          Pay now
        </a>
      ) : null}
    </>
  );
}

function MobileOrderSummary(
  props: Parameters<typeof OrderSummaryContent>[0],
) {
  const [summaryOpen, setSummaryOpen] = useState(false);

  return (
    <div className="border-b border-[#d7d7d7] bg-[#f3f3f3] lg:hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-4"
        onClick={() => setSummaryOpen((open) => !open)}
      >
        <span className="text-sm font-medium uppercase">
          Order summary
        </span>

        <span className="flex items-center gap-2">
          <span className="text-sm font-bold">
            {props.total}
          </span>

          <span>{summaryOpen ? "▲" : "▼"}</span>
        </span>
      </button>

      {summaryOpen ? (
        <div className="border-t border-[#d7d7d7] px-4 pb-4">
          <OrderSummaryContent {...props} />
        </div>
      ) : null}
    </div>
  );
}

export default function CheckoutPageClient() {
  const { cart } = useCart();

  const [country, setCountry] = useState("GB");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [billingSameAsShipping, setBillingSameAsShipping] =
    useState(true);

  const [paymentMethod, setPaymentMethod] =
    useState<"card" | "paypal">("card");

  const lines = cart?.lines ?? [];
  const checkoutUrl = cart?.checkoutUrl ?? "#";

  const currencyCode =
    cart?.cost.totalAmount.currencyCode ??
    cart?.cost.subtotalAmount.currencyCode ??
    "GBP";

  const subtotalFormatted = useMemo(() => {
    if (!cart?.cost.subtotalAmount) return "—";

    return formatCartMoney(
      cart.cost.subtotalAmount.amount,
      cart.cost.subtotalAmount.currencyCode,
    );
  }, [cart?.cost.subtotalAmount]);

  const totalFormatted = useMemo(() => {
    if (!cart?.cost.totalAmount) return "—";

    return formatCartMoney(
      cart.cost.totalAmount.amount,
      cart.cost.totalAmount.currencyCode,
    );
  }, [cart?.cost.totalAmount]);

  const taxAmount =
    cart?.cost.totalTaxAmount?.amount ?? null;

  const itemCount =
    cart?.totalQuantity ?? lines.length;

  if (!cart || lines.length === 0) {
    return null;
  }

  return (
    <div className="min-h-dvh bg-[#efefef] font-[Helvetica] text-black">
      <CheckoutHeader />

      <MobileOrderSummary
        lines={lines}
        subtotal={subtotalFormatted}
        total={totalFormatted}
        tax={taxAmount}
        currencyCode={currencyCode}
        itemCount={itemCount}
        checkoutUrl={checkoutUrl}
      />

      <div className="mx-auto lg:grid lg:grid-cols-[58%_42%]">
        {/* LEFT */}
        <main className="border-r border-[#d7d7d7] px-6 py-8 lg:px-10">
          <h1 className="sr-only">Checkout</h1>

          <form
            className="mx-auto max-w-[520px]"
            onSubmit={(event) => {
              event.preventDefault();
              window.location.href = checkoutUrl;
            }}
          >
            {/* EXPRESS */}
            <section aria-label="Express checkout">
              <p className="mb-3 text-center text-xs font-medium uppercase text-neutral-600">
                Express checkout
              </p>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={checkoutUrl}
                  className="flex h-[52px] items-center justify-center bg-[#5a31f4] text-white"
                >
                  <span className="text-lg font-semibold">
                    shop
                  </span>
                </a>

                <a
                  href={checkoutUrl}
                  className="flex h-[52px] items-center justify-center bg-[#ffc439]"
                >
                  <span className="text-lg font-bold text-[#003087]">
                    PayPal
                  </span>
                </a>
              </div>
            </section>

            <OrDivider />

            {/* CONTACT */}
            <section>
              <SectionTitle>Contact</SectionTitle>

              <input
                type="email"
                autoComplete="email"
                placeholder="Email"
                required
                className={inputClass}
              />

              <label className="mt-3 flex items-start gap-2 text-sm uppercase">
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(event) =>
                    setMarketingOptIn(event.target.checked)
                  }
                  className="mt-0.5"
                />

                Email me with news and offers
              </label>
            </section>

            {/* DELIVERY */}
            <section className="mt-8">
              <SectionTitle>Delivery</SectionTitle>

              <select
                value={country}
                onChange={(event) =>
                  setCountry(event.target.value)
                }
                className={inputClass}
              >
                {SHIPPING_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <input
                  placeholder="First name"
                  required
                  className={inputClass}
                />

                <input
                  placeholder="Last name"
                  required
                  className={inputClass}
                />
              </div>

              <input
                placeholder="Address"
                required
                className={`${inputClass} mt-3`}
              />

              <input
                placeholder="Apartment, suite, etc. (optional)"
                className={`${inputClass} mt-3`}
              />

              <div className="mt-3 grid grid-cols-2 gap-3">
                <input
                  placeholder="City"
                  required
                  className={inputClass}
                />

                <input
                  placeholder="Postcode"
                  required
                  className={inputClass}
                />
              </div>

              <div className="relative mt-3">
                <input
                  type="tel"
                  placeholder="Phone"
                  required
                  className={`${inputClass} pr-10`}
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  ?
                </span>
              </div>
            </section>

            {/* SHIPPING */}
            <section className="mt-8">
              <SectionTitle>Shipping method</SectionTitle>

              <div className="border border-[#d7d7d7] bg-[#e8e8e8] px-4 py-4 text-[14px] text-neutral-600">
                Enter your shipping address to view
                available shipping methods.
              </div>
            </section>

            {/* PAYMENT */}
            <section className="mt-8">
              <SectionTitle>Payment</SectionTitle>

              <p className="mb-4 text-sm text-neutral-600">
                All transactions are secure and encrypted.
              </p>

              <div className="overflow-hidden border border-[#d7d7d7] bg-white">
                {/* CARD */}
                <label className="flex items-center justify-between border-b border-[#d7d7d7] px-4 py-3">
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={paymentMethod === "card"}
                      onChange={() =>
                        setPaymentMethod("card")
                      }
                    />

                    <span className="text-sm font-bold uppercase">
                      Credit card
                    </span>
                  </span>

                  <span className="flex gap-1 text-[10px] font-bold">
                    <span>VISA</span>
                    <span>MC</span>
                    <span className="text-neutral-400">
                      +5
                    </span>
                  </span>
                </label>

                {paymentMethod === "card" ? (
                  <div className="space-y-3 bg-[#f5f5f5] p-4">
                    <input
                      placeholder="Card number"
                      className={inputClass}
                      readOnly
                      onFocus={() => {
                        window.location.href =
                          checkoutUrl;
                      }}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        placeholder="Expiration date (MM / YY)"
                        className={inputClass}
                        readOnly
                        onFocus={() => {
                          window.location.href =
                            checkoutUrl;
                        }}
                      />

                      <input
                        placeholder="Security code"
                        className={inputClass}
                        readOnly
                        onFocus={() => {
                          window.location.href =
                            checkoutUrl;
                        }}
                      />
                    </div>

                    <input
                      placeholder="Name on card"
                      className={inputClass}
                    />

                    <label className="flex items-center gap-2 text-sm uppercase">
                      <input
                        type="checkbox"
                        checked={billingSameAsShipping}
                        onChange={(event) =>
                          setBillingSameAsShipping(
                            event.target.checked,
                          )
                        }
                      />

                      Use shipping address as billing
                      address
                    </label>
                  </div>
                ) : null}

                {/* PAYPAL */}
                <label className="flex items-center justify-between border-t border-[#d7d7d7] px-4 py-3">
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={
                        paymentMethod === "paypal"
                      }
                      onChange={() =>
                        setPaymentMethod("paypal")
                      }
                    />

                    <span className="text-sm font-bold uppercase">
                      PayPal
                    </span>
                  </span>
                </label>
              </div>
            </section>

            {/* MOBILE BUTTON */}
            <div className="mt-8 lg:hidden">
              <button
                type="submit"
                className="w-full bg-black py-[16px] text-[14px] font-bold uppercase text-white"
              >
                Pay now
              </button>
            </div>
          </form>
        </main>

        {/* RIGHT */}
        <aside className="hidden border-l border-[#d7d7d7] bg-[#f3f3f3] lg:block">
          <div className="sticky top-0 mx-auto max-w-[420px] p-8">
            <OrderSummaryContent
              lines={lines}
              subtotal={subtotalFormatted}
              total={totalFormatted}
              tax={taxAmount}
              currencyCode={currencyCode}
              itemCount={itemCount}
              checkoutUrl={checkoutUrl}
            />
          </div>
        </aside>
      </div>

      <footer className="border-t border-[#d7d7d7] bg-[#efefef] px-4 py-6 text-center text-[11px] uppercase text-neutral-600">
        All rights reserved Palace Skateboards
      </footer>
    </div>
  );
}