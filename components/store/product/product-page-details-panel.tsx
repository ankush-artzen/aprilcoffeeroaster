"use client";

import ProductPageAddToCart from "components/store/product/product-page-add-to-cart";
import ProductPageHeader from "components/store/product/product-page-header";
import ProductPageMetafieldBody from "components/store/product/product-page-metafield-body";
import ProductPageQuantityInput from "components/store/product/product-page-quantity-input";
import type { ProductPageVariant } from "components/store/product/product-page-types";
import SubscribeAndSave from "components/store/product/subscribe-and-save";
import TastingMenuBooking from "components/store/product/tasting-menu-booking";
import { TASTING_MENU_HANDLE } from "lib/constants";
import type { Product } from "lib/shopify/types";
import type {
    ParsedInfoLink,
    ParsedRecipeContent,
    ParsedSizeChart,
    ParsedTechnicalDetails,
} from "lib/store/parse-product-metafields";
import {
    getSubscriptionGroupName,
    getSubscriptionPlans,
} from "lib/store/subscription-plans";
import Link from "next/link";
import { useState } from "react";

type ProductPageDetailsPanelProps = {
  product: Product;
  title: string;
  descriptionLines: string[];
  technicalDetails: ParsedTechnicalDetails | null;
  sizeChart: ParsedSizeChart | null;
  recommendations: ParsedRecipeContent | null;
  supplierInformation: ParsedRecipeContent | null;
  infoLink: ParsedInfoLink | null;
  variants: ProductPageVariant[];
  selectedVariantId: string;
  selectedVariant: ProductPageVariant | undefined;
  quantity: number;
  hasAnyVariantAvailable: boolean;
  openAccordion: string | null;
  onToggleAccordion: (id: string) => void;
  onSelectedVariantIdChange: (id: string) => void;
  onQuantityChange: (next: number) => void;
  onOpenMetafieldModal: (modal: "technical-details" | "size-chart") => void;
};

function AccordionChevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`absolute right-0 bottom-[10px] h-3 w-3 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M5 7l5 6 5-6H5z" />
    </svg>
  );
}

const accordionButtonClass =
  "relative w-full border-b-[2pt] border-hover-frame pt-4 pb-1 text-left text-standard-grey";

const accordionTitleClass =
  "type-h2 block text-[18px] uppercase leading-none ml-2";

const accordionBodyClass =
  "border-x-[2pt] border-b-[2pt] border-hover-frame px-2 py-4 text-standard-grey";

const metafieldBodyClass = `
  type-text2
  space-y-3
  text-[13px]
  leading-[1.35]
  tracking-[-0.03em]

  sm:text-[14px]
  md:text-[15px]

  [&_p]:mt-0
  [&_p+p]:mt-3
  [&_br]:block
`;

export default function ProductPageDetailsPanel({
  product,
  title,
  descriptionLines,
  technicalDetails,
  sizeChart,
  recommendations,
  supplierInformation,
  infoLink,
  variants,
  selectedVariantId,
  selectedVariant,
  quantity,
  hasAnyVariantAvailable,
  openAccordion,
  onToggleAccordion,
  onSelectedVariantIdChange,
  onQuantityChange,
  onOpenMetafieldModal,
}: ProductPageDetailsPanelProps) {
  const showVariantControl =
    variants.length > 1 || Boolean(selectedVariant?.label);
  const subscriptionPlans = getSubscriptionPlans(product);
  const [selectedPlanId, setSelectedPlanId] = useState(
    subscriptionPlans[0]?.id ?? "",
  );
  const selectedPlan =
    subscriptionPlans.find((plan) => plan.id === selectedPlanId) ??
    subscriptionPlans[0];
  const selectedProductVariant = product.variants.find(
    (variant) => variant.id === selectedVariantId,
  );
  const showProductDetails =
    descriptionLines.length > 0 || Boolean(infoLink);

  return (
    <div
      className="
      w-[28%]
      min-w-0
      flex
      flex-col
      items-start

      max-md:w-full
      max-md:px-5
    "
    >
      {/* HEADER — desktop only; mobile uses block above images */}
      <ProductPageHeader
        title={title}
        price={selectedVariant?.price ?? ""}
        className="max-md:hidden"
      />

      <div className="mt-6 w-full max-md:order-2">
        {/* Product Details — product description/content */}
        {showProductDetails ? (
          <>
            <button
              type="button"
              onClick={() => onToggleAccordion("details")}
              className={accordionButtonClass}
            >
              <span className={accordionTitleClass}>Product Details</span>
              <AccordionChevron open={openAccordion === "details"} />
            </button>

            {openAccordion === "details" ? (
              <div
                id="product-description"
                aria-label="product-description"
                className={accordionBodyClass}
              >
                <div
                  className="
              type-text2
              space-y-1
              text-[13px]
              leading-[1.35]
              tracking-[-0.03em]

              sm:text-[14px]
              md:text-[15px]
            "
                >
                  {descriptionLines.map((line) => {
                    const separatorIndex = line.indexOf(":");
                    if (separatorIndex > 0) {
                      const label = line.slice(0, separatorIndex + 1);
                      const value = line.slice(separatorIndex + 1).trim();
                      return (
                        <p key={line}>
                          <strong
                            style={{
                              fontWeight: 700,
                              fontSynthesis: "weight",
                            }}
                          >
                            {label}
                          </strong>
                          {value ? <> {value}</> : null}
                        </p>
                      );
                    }

                    return <p key={line}>{line}</p>;
                  })}

                  {infoLink ? (
                    <p className={descriptionLines.length > 0 ? "pt-3" : undefined}>
                      {infoLink.external ? (
                        <a
                          href={infoLink.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 hover:no-underline"
                        >
                          {infoLink.label}
                          <span aria-hidden="true"> →</span>
                        </a>
                      ) : (
                        <Link
                          href={infoLink.href}
                          className="underline underline-offset-2 hover:no-underline"
                        >
                          {infoLink.label}
                          <span aria-hidden="true"> →</span>
                        </Link>
                      )}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </>
        ) : null}

        {/* Supplier Information */}
        {supplierInformation ? (
          <>
            <button
              type="button"
              onClick={() => onToggleAccordion("supplier")}
              className={accordionButtonClass}
            >
              <span className={accordionTitleClass}>Supplier Information</span>
              <AccordionChevron open={openAccordion === "supplier"} />
            </button>

            {openAccordion === "supplier" ? (
              <div className={accordionBodyClass}>
                <ProductPageMetafieldBody
                  content={supplierInformation}
                  className={metafieldBodyClass}
                />
              </div>
            ) : null}
          </>
        ) : null}

        {/* Recommendations — Filter Coffee & Limited Coffee only */}
        {recommendations ? (
          <>
            <button
              type="button"
              onClick={() => onToggleAccordion("recommendations")}
              className={accordionButtonClass}
            >
              <span className={accordionTitleClass}>Recommendations</span>
              <AccordionChevron open={openAccordion === "recommendations"} />
            </button>

            {openAccordion === "recommendations" ? (
              <div className={accordionBodyClass}>
                <ProductPageMetafieldBody
                  content={recommendations}
                  className={metafieldBodyClass}
                />
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      {/* LINKS — lg: after price; mobile: after description */}
      {/* {technicalDetails || sizeChart ? (
        <div className="mt-5 flex flex-col gap-0 max-md:order-3">
          {technicalDetails ? (
            <button
              type="button"
              className="m-0 p-0 text-left text-sm uppercase underline hover:text-gray-300 hover:no-underline"
              aria-label="product-technical-details"
              onClick={() => onOpenMetafieldModal("technical-details")}
            >
              Technical Details
            </button>
          ) : null}

          {sizeChart ? (
            <button
              type="button"
              className="m-0 p-0 text-left text-sm uppercase underline hover:text-gray-300 hover:no-underline"
              aria-label="product-size-chart"
              onClick={() => onOpenMetafieldModal("size-chart")}
            >
              Size Chart
            </button>
          ) : null}
        </div>
      ) : null} */}

      {/* ACTIONS — mobile: first after product image */}
      {product.handle === TASTING_MENU_HANDLE ? (
        <div className="mt-6 w-full max-md:order-1 max-md:mt-5">
          <TastingMenuBooking product={product} variantId={selectedVariantId} />
        </div>
      ) : variants.length > 0 && hasAnyVariantAvailable ? (
        <div className="mt-6 flex w-full flex-col gap-3 max-md:order-1 max-md:mt-5">
          {subscriptionPlans.length > 0 && selectedPlan ? (
            <SubscribeAndSave
              groupName={getSubscriptionGroupName(product)}
              plans={subscriptionPlans}
              selectedPlanId={selectedPlan.id}
              price={selectedProductVariant?.price}
              onSelectedPlanIdChange={setSelectedPlanId}
            />
          ) : null}
          <div
            aria-label="product-actions-wrapper"
            className={
              showVariantControl
                ? "grid w-full grid-cols-3 gap-2"
                : "flex w-full gap-2"
            }
          >
            {showVariantControl ? (
              <div
                aria-label="product-variant-select-wrapper"
                className="col-span-2 w-full"
              >
                {variants.length > 1 ? (
                  <select
                    id="variant-selector"
                    aria-label="product-select"
                    role="combobox"
                    value={selectedVariantId}
                    onChange={(event) =>
                      onSelectedVariantIdChange(event.target.value)
                    }
                    className="
                  h-7
                  w-full
                  cursor-pointer
                  appearance-none
                  border-2
                  border-black
                  bg-[image:var(--background-image-selector-icon)]
                  bg-[top_50%_left_95%]
                  bg-no-repeat
                  pl-2
                  text-sm
                  uppercase
                  outline-hidden

                  hover:bg-white
                  hover:text-black
                  focus:ring-0

                  max-md:h-8
                  max-md:text-base
                "
                  >
                    {variants.map((variant) => (
                      <option
                        key={variant.id}
                        value={variant.id}
                        className="uppercase"
                      >
                        {variant.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div
                    aria-label="product-variant"
                    className="
                  flex
                  h-7
                  w-full
                  items-center
                  border-2
                  border-black
                  pl-2
                  text-sm
                  uppercase

                  max-md:h-8
                  max-md:text-base
                "
                  >
                    {selectedVariant?.label}
                  </div>
                )}
              </div>
            ) : null}

            <div
              aria-label="product-quantity-wrapper"
              className={showVariantControl ? "col-span-1" : "shrink-0"}
            >
              <ProductPageQuantityInput
                quantity={quantity}
                setQuantity={onQuantityChange}
              />
            </div>

            <div
              className={showVariantControl ? "col-span-3" : "min-w-0 flex-1"}
            >
              <ProductPageAddToCart
                product={product}
                selectedVariantId={selectedVariantId}
                variantLabel={selectedVariant?.label ?? "item"}
                quantity={quantity}
                sellingPlan={selectedPlan}
                className="btn-brand flex h-7 w-full items-center justify-center border-[2pt] px-4 text-sm font-bold uppercase max-md:h-8 max-md:text-base"
              />
            </div>
          </div>
        </div>
      ) : null}

      {subscriptionPlans.length > 0 ? (
        <blockquote className="mt-3 w-full border-l-2 border-[#ff8000] pl-3 text-[13px] leading-snug font-bold italic max-md:order-4 max-md:mt-5">
          <p>
            <span className="text-[#ff8000]">
              Before you Subscribe please note that regardless of when you
              subscribe you will be charged again on the 15th. So, if you want
              to avoid to be charged twice in your first month. Please place
              your order after the 15th.{" "}
              <span className="text-[#ff2a00]">
                Subscriptions are shipped the first week of the following
                month.{" "}
                <span className="text-[#ff8000]">
                  We do not offer VAT free invoices on Subscriptions.
                </span>
              </span>
            </span>
          </p>
        </blockquote>
      ) : null}
    </div>
  );
}
