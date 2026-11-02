"use client";

import type { Money, SellingPlan } from "lib/shopify/types";
import { formatDeliveryPrice } from "lib/store/subscription-plans";

function PlanRadio({ selected }: { selected: boolean }) {
  return (
    <span
      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
        selected
          ? "border-[#3c9a40] bg-[#3c9a40] text-white"
          : "border-[#c8c8c8] bg-white"
      }`}
      aria-hidden
    >
      {selected ? (
        <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" fill="none">
          <path
            d="M3.2 8.2 6.4 11.2 12.8 4.8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}

export default function SubscribeAndSave({
  groupName,
  plans,
  selectedPlanId,
  price,
  onSelectedPlanIdChange,
}: {
  groupName: string;
  plans: SellingPlan[];
  selectedPlanId: string;
  price?: Money;
  onSelectedPlanIdChange: (id: string) => void;
}) {
  const priceLabel = price ? formatDeliveryPrice(price) : null;

  return (
    <div className="w-full">
      <p className="mb-1.5 text-[13px] text-[#6d6d6d]">{groupName}</p>
      <div className="rounded-md border border-[#d7d7d7] bg-[#f6f6f6] px-3 py-3">
        <p className="mb-2 text-[11px] font-medium tracking-[0.16em] text-[#8d8d8d] uppercase">
          Delivery frequency
        </p>
        <div
          className="flex flex-col gap-1"
          role="radiogroup"
          aria-label="Delivery frequency"
        >
          {plans.map((plan) => {
            const selected = plan.id === selectedPlanId;

            return (
              <label
                key={plan.id}
                className={`flex cursor-pointer items-start justify-between gap-3 rounded px-1.5 py-1.5 ${
                  selected ? "bg-[#e7f6e8] text-[#3c9a40]" : "text-[#4a4a4a]"
                }`}
              >
                <span className="flex min-w-0 items-start gap-2">
                  <input
                    type="radio"
                    name="delivery-frequency"
                    value={plan.id}
                    checked={selected}
                    onChange={() => onSelectedPlanIdChange(plan.id)}
                    className="sr-only"
                  />
                  <PlanRadio selected={selected} />
                  <span
                    className={`text-[13px] leading-snug ${
                      selected ? "font-semibold" : ""
                    }`}
                  >
                    {plan.name}
                  </span>
                </span>
                {priceLabel ? (
                  <span className="shrink-0 text-right text-[13px] leading-tight">
                    <span
                      className={selected ? "font-semibold" : "font-medium"}
                    >
                      {priceLabel}
                    </span>
                    <span className="block text-[12px] font-normal">
                      / delivery
                    </span>
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
