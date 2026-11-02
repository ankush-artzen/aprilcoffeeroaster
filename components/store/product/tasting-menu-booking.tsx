"use client";

import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useCart } from "components/cart/cart-context";
import { TASTING_MENU_TIMEZONE } from "lib/constants";
import type { Product } from "lib/shopify/types";
import {
  addTastingReservation,
  loadTastingMonth,
} from "lib/tasting-menu/actions";
import { TASTING_BOOKING_FIELDS } from "lib/tasting-menu/fields";
import type { TastingMonth, TastingSlot } from "lib/tasting-menu/types";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function copenhagenToday(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TASTING_MENU_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function parseMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  if (!year || !monthNumber) {
    throw new Error("Invalid month.");
  }
  return { year, monthNumber };
}

function shiftMonth(month: string, by: number) {
  const { year, monthNumber } = parseMonth(month);
  const next = new Date(Date.UTC(year, monthNumber - 1 + by, 1));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthParts(month: string) {
  const { year, monthNumber } = parseMonth(month);
  return {
    name: new Intl.DateTimeFormat("en-US", {
      month: "long",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, monthNumber - 1, 1))),
    year: String(year),
  };
}

function shortDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

function calendarCells(month: string) {
  const { year, monthNumber } = parseMonth(month);
  const count = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const leading = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
  const cells: Array<number | null> = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: count }, (_, index) => index + 1),
  ];

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function clockTo24(time: string) {
  const match = time.match(/^(\d{1,2}):(\d{2}) (am|pm)$/i);
  if (!match?.[1] || !match[2] || !match[3]) return time;

  let hours = Number(match[1]) % 12;
  if (match[3].toLowerCase() === "pm") hours += 12;
  return `${hours}:${match[2]}`;
}

function formatRange(slot: TastingSlot, hour24: boolean) {
  if (!hour24) return `${slot.startTime} – ${slot.endTime}`;
  return `${clockTo24(slot.startTime)} – ${clockTo24(slot.endTime)}`;
}

function longDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

function upperTime(time: string) {
  return time.replace(/am|pm/g, (part) => part.toUpperCase());
}

function daysFromToday(date: string, today: string) {
  const [startYear, startMonth, startDay] = today.split("-").map(Number);
  const [year, month, day] = date.split("-").map(Number);
  if (!startYear || !startMonth || !startDay || !year || !month || !day) {
    return "";
  }

  const days = Math.round(
    (Date.UTC(year, month - 1, day) -
      Date.UTC(startYear, startMonth - 1, startDay)) /
      86400000,
  );
  if (days <= 0) return "today";
  if (days === 1) return "in a day";
  return `in ${days} days`;
}

function SelectedTime({
  date,
  slot,
  eventLabel,
  location,
  minimumAttendees,
  quantity,
  setQuantity,
  answers,
  touched,
  setAnswer,
  touch,
  canAdd,
  isPending,
  submitError,
  onAdd,
}: {
  date: string;
  slot: TastingSlot;
  eventLabel: string;
  location: string;
  minimumAttendees: number;
  quantity: number;
  setQuantity: (next: number) => void;
  answers: Record<string, string>;
  touched: Record<string, boolean>;
  setAnswer: (id: string, value: string) => void;
  touch: (id: string) => void;
  canAdd: boolean;
  isPending: boolean;
  submitError: string | null;
  onAdd: () => void;
}) {
  const max = slot.availableSlots;

  return (
    <div className="pr-8">
      <p className="text-xs font-medium tracking-wider text-[#6d7175] uppercase">
        Selected Time
      </p>
      <div className="mt-3 rounded-md border border-[#e3e3e3] px-4 py-3 text-sm leading-6">
        <p className="flex items-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            aria-hidden
            className="mt-[3px] mr-2.5 h-4 w-4 shrink-0"
            fill="currentColor"
          >
            <rect
              x="40"
              y="64"
              width="176"
              height="152"
              rx="8"
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
            />
            <line
              x1="176"
              y1="24"
              x2="176"
              y2="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
            />
            <line
              x1="80"
              y1="24"
              x2="80"
              y2="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
            />
            <line
              x1="40"
              y1="104"
              x2="216"
              y2="104"
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
            />
            <circle cx="92" cy="140" r="12" />
            <circle cx="164" cy="140" r="12" />
            <circle cx="92" cy="180" r="12" />
            <circle cx="164" cy="180" r="12" />
          </svg>
          <span>
            {longDate(date)} from {upperTime(slot.startTime)} -{" "}
            {upperTime(slot.endTime)} ({TASTING_MENU_TIMEZONE}) with{" "}
            {eventLabel}
          </span>
        </p>
        <p className="mt-1 flex items-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            aria-hidden
            className="mt-[3px] mr-2.5 h-4 w-4 shrink-0"
            fill="currentColor"
          >
            <circle
              cx="128"
              cy="104"
              r="32"
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
            />
            <path
              d="M208,104c0,72-80,128-80,128S48,176,48,104a80,80,0,0,1,160,0Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
            />
          </svg>
          <span>{location}</span>
        </p>
      </div>

      <div className="my-4 text-left">
        <p>How many people will be attending this event?</p>
        <p className="mt-1 text-sm text-[#6b7280]">
          {minimumAttendees} minimum attendees are required for this booking
        </p>
        <div className="flex items-center pt-2">
          <button
            type="button"
            aria-label="decrease-quantity"
            disabled={quantity <= minimumAttendees}
            onClick={() =>
              setQuantity(Math.max(minimumAttendees, quantity - 1))
            }
            className="cursor-pointer px-3 py-[3px] text-lg font-bold disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <input
            type="text"
            inputMode="numeric"
            aria-label="quantity-input"
            value={quantity}
            onChange={(event) => {
              const next = parseInt(event.target.value, 10);
              if (Number.isNaN(next)) return;
              setQuantity(Math.min(max, Math.max(minimumAttendees, next)));
            }}
            className="m-0 h-9 w-[75px] rounded-[5px] border-0 bg-[#eeeeee] text-center text-lg"
          />
          <button
            type="button"
            aria-label="increase-quantity"
            disabled={quantity >= max}
            onClick={() => setQuantity(Math.min(max, quantity + 1))}
            className="cursor-pointer px-3 py-[3px] text-lg font-bold disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <div className="mb-4 text-left">
        {TASTING_BOOKING_FIELDS.map((field) => {
          const id = String(field.id);
          const value = answers[id] ?? "";
          const invalid = Boolean(touched[id]) && !value.trim();
          return (
            <div key={field.id} className="mb-4">
              <label
                htmlFor={`servicify-custom-field-${field.id}`}
                className="font-semibold"
              >
                {field.label}{" "}
                <span aria-hidden className="text-[#d72c0d]">
                  *
                </span>
              </label>
              <input
                id={`servicify-custom-field-${field.id}`}
                type="text"
                required
                value={value}
                aria-invalid={invalid}
                aria-describedby={
                  field.helpText
                    ? `servicify-custom-field-${field.id}-helptext`
                    : undefined
                }
                onChange={(event) => setAnswer(id, event.target.value)}
                onBlur={() => touch(id)}
                className="mt-1 w-full rounded-md border border-[#c9cccf] px-3 py-2 text-base outline-none"
              />
              {invalid ? (
                <p
                  id={`servicify-custom-field-${field.id}-error`}
                  role="alert"
                  className="mt-1 text-sm text-[#d72c0d]"
                >
                  This field is required.
                </p>
              ) : null}
              {field.helpText ? (
                <p
                  id={`servicify-custom-field-${field.id}-helptext`}
                  className="mt-2 text-sm text-[#6b7280]"
                >
                  {field.helpText}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {submitError ? (
        <p className="mb-2 text-sm text-[#d72c0d]" role="alert">
          {submitError}
        </p>
      ) : null}

      <button
        type="button"
        disabled={!canAdd}
        onClick={onAdd}
        className={`mb-2 w-full rounded-md border-[2pt] px-4 py-3 text-base font-semibold text-white ${
          canAdd
            ? "btn-brand"
            : "cursor-not-allowed border-[#c5c5c5] bg-[#c5c5c5]"
        }`}
      >
        {isPending ? "Adding…" : "Add to Cart"}
      </button>
    </div>
  );
}

function AddedToCart({
  booked,
  today,
  checkoutUrl,
}: {
  booked: {
    date: string;
    startTime: string;
    endTime: string;
    eventName: string;
  };
  today: string;
  checkoutUrl: string;
}) {
  return (
    <div className="box-border px-5 pt-7 pb-6 min-[601px]:px-8 min-[601px]:pb-8">
      <p className="pr-7 text-lg font-semibold">
        {booked.eventName} was added to your cart.
      </p>
      <div className="my-4 flex items-start justify-between gap-4">
        <div>
          <p>{longDate(booked.date)}</p>
          <p>
            {upperTime(booked.startTime)} - {upperTime(booked.endTime)}{" "}
            <span>({TASTING_MENU_TIMEZONE})</span>
          </p>
        </div>
        <p className="capitalize">{daysFromToday(booked.date, today)}</p>
      </div>
      <p>
        Your booking is not confirmed until you checkout. You will receive an
        email confirmation and detailed calendar invite after checking out.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5 max-[600px]:flex-col-reverse max-[600px]:items-stretch max-[600px]:gap-2">
        <a
          href={checkoutUrl}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#111827] bg-[#111827] px-[1.4em] py-[0.7em] text-center text-base leading-tight font-semibold whitespace-nowrap text-white no-underline transition-[background-color,border-color,color,box-shadow] duration-150 hover:border-black hover:bg-black hover:text-white hover:shadow-[0_1px_4px_rgba(0,0,0,0.18)] focus:border-black focus:bg-black focus:text-white focus:shadow-[0_1px_4px_rgba(0,0,0,0.18)] max-[600px]:w-full max-[600px]:whitespace-normal"
        >
          Checkout
        </a>
      </div>
    </div>
  );
}

export default function TastingMenuBooking({
  product,
  variantId,
}: {
  product: Product;
  variantId: string;
}) {
  const router = useRouter();
  const { addCartItem } = useCart();
  const today = copenhagenToday();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [data, setData] = useState<TastingMonth | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [hour24, setHour24] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<"calendar" | "details" | "confirmed">(
    "calendar",
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [booked, setBooked] = useState<{
    date: string;
    startTime: string;
    endTime: string;
    eventName: string;
    checkoutUrl: string;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    console.log("[april-tasting-menu]", {
      handle: product.handle,
      title: product.title,
      variantId,
      variants: product.variants.map((item) => ({
        id: item.id,
        title: item.title,
      })),
    });
  }, [product, variantId]);

  useEffect(() => {
    if (!open) return;

    let ignore = false;
    setIsLoading(true);
    setLoadError(false);

    loadTastingMonth(variantId, month)
      .then((result) => {
        console.log("[april-tasting-menu] month", { variantId, month, result });
        if (ignore) return;
        setData(result);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("[april-tasting-menu] month failed", {
          variantId,
          month,
          error,
        });
        if (ignore) return;
        setLoadError(true);
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [open, month, reloadKey, variantId]);

  const monthData = data?.month === month ? data : null;
  const selectedDay = monthData?.days.find((day) => day.date === selectedDate);
  const selectedSlot = selectedDay?.slots.find(
    (slot) => slot.startTime === selectedStart,
  );
  const variant = product.variants.find((item) => item.id === variantId);
  const canGoBack = month > today.slice(0, 7);
  const caption = monthParts(month);
  const image = product.featuredImage?.url;

  const minimumAttendees = monthData?.minimumAttendees || 1;
  const answersReady = TASTING_BOOKING_FIELDS.every((field) =>
    Boolean(answers[String(field.id)]?.trim()),
  );

  const chooseDate = (date: string) => {
    setSelectedDate(date);
    setSelectedStart(null);
    setQuantity(1);
    setSubmitError(null);
  };

  const openDetails = (slot: TastingSlot) => {
    setSelectedStart(slot.startTime);
    setQuantity(Math.min(slot.availableSlots, Math.max(minimumAttendees, 1)));
    setAnswers({});
    setTouched({});
    setSubmitError(null);
    setStep("details");
  };

  const close = () => {
    if (isPending) return;
    setOpen(false);
    setStep("calendar");
    setSelectedStart(null);
    setBooked(null);
    setSubmitError(null);
  };

  const reserve = () => {
    if (
      !variant ||
      !selectedDate ||
      !selectedSlot ||
      isPending ||
      !answersReady
    )
      return;

    const seats = Math.min(
      Math.max(quantity, minimumAttendees),
      selectedSlot.availableSlots,
    );
    const nextAnswers = Object.fromEntries(
      TASTING_BOOKING_FIELDS.map((field) => [
        String(field.id),
        answers[String(field.id)]?.trim() ?? "",
      ]),
    );
    setSubmitError(null);

    startTransition(async () => {
      const result = await addTastingReservation({
        variantId,
        productTitle: product.title,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        quantity: seats,
        answers: nextAnswers,
      });
      console.log("[april-tasting-menu] reservation", result);

      if (result.error || !result.lineAttributes || !result.checkoutUrl) {
        setSubmitError(result.error ?? "Could not reserve this time.");
        return;
      }

      addCartItem(variant, product, seats, undefined, result.lineAttributes);
      setBooked({
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        eventName: monthData?.eventName || product.title,
        checkoutUrl: result.checkoutUrl,
      });
      setStep("confirmed");
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setStep("calendar");
          setBooked(null);
          setOpen(true);
        }}
        className="btn-brand flex h-7 w-full items-center justify-center border-[2pt] px-4 text-sm font-bold uppercase max-md:h-8 max-md:text-base"
      >
        Select a time
      </button>

      <Dialog open={open} onClose={close} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/40" />
        <div className="fixed inset-0">
          <DialogPanel
            aria-label="Select a Time"
            className={
              step === "calendar"
                ? "absolute top-[4vh] right-auto bottom-auto left-1/2 mr-[-50%] h-[inherit] max-h-[90%] w-[80%] max-w-[900px] -translate-x-1/2 overflow-auto rounded-2xl border-0 bg-white p-0 text-black shadow-[0_33px_35px_-1px_rgba(0,0,0,0.21)] outline-none max-[500px]:inset-0 max-[500px]:m-0 max-[500px]:h-full max-[500px]:max-h-full max-[500px]:w-full max-[500px]:max-w-full max-[500px]:translate-none max-[500px]:rounded-none"
                : `absolute top-1/2 right-auto bottom-auto left-1/2 mr-[-50%] h-[inherit] max-h-[90%] w-full max-w-[840px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border-0 bg-white text-black shadow-[0_33px_35px_-1px_rgba(0,0,0,0.21)] outline-none ${
                    step === "confirmed" ? "p-0" : "p-4"
                  }`
            }
          >
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-[#616161] hover:bg-[#f1f1f1] hover:text-[#303030]"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M3.75 3.75l8.5 8.5M12.25 3.75l-8.5 8.5" />
              </svg>
            </button>
            {step === "calendar" ? (
              <div className="p-6">
                <div className="flex items-start gap-3 pr-8">
                  {image ? (
                    <img
                      src={image}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-full border border-black/10 object-cover"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="text-base font-semibold">
                      Select a time for {monthData?.eventName || product.title}
                    </p>
                    <p className="mt-1 flex items-center text-sm text-[#6b7280]">
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden
                        className="mr-1.5 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-5.8-3.8-9s1.3-6.2 3.8-9z" />
                      </svg>
                      Timezone: {TASTING_MENU_TIMEZONE}
                    </p>
                  </div>
                </div>

                <div className="mt-4 md:grid md:grid-cols-2">
                  <div>
                    <div className="relative mb-2 text-center">
                      <button
                        type="button"
                        aria-label="Previous Month"
                        disabled={!canGoBack || isLoading}
                        onClick={() =>
                          setMonth((current) => shiftMonth(current, -1))
                        }
                        className="absolute top-0 left-1 flex h-7 w-7 items-center justify-center rounded-full text-[#6b7280] hover:bg-[#f3f4f6] disabled:opacity-30"
                      >
                        ‹
                      </button>
                      <p className="text-[1.1em] leading-tight">
                        <span className="font-semibold">{caption.name}</span>{" "}
                        <span className="font-normal text-[#6b7280]">
                          {caption.year}
                        </span>
                      </p>
                      <button
                        type="button"
                        aria-label="Next Month"
                        disabled={isLoading}
                        onClick={() =>
                          setMonth((current) => shiftMonth(current, 1))
                        }
                        className="absolute top-0 right-1 flex h-7 w-7 items-center justify-center rounded-full text-[#6b7280] hover:bg-[#f3f4f6] disabled:opacity-30"
                      >
                        ›
                      </button>
                    </div>

                    <div className="grid grid-cols-7 text-center">
                      {WEEKDAYS.map((day) => (
                        <span
                          key={day}
                          className="py-2 text-[0.7em] font-semibold tracking-wide text-[#9ca3af] uppercase"
                        >
                          {day}
                        </span>
                      ))}
                      {calendarCells(month).map((day, index) => {
                        if (!day) {
                          return (
                            <span
                              key={`empty-${index}`}
                              className="min-h-[42px]"
                            />
                          );
                        }

                        const date = `${month}-${String(day).padStart(2, "0")}`;
                        const slots =
                          monthData?.days.find((item) => item.date === date)
                            ?.slots.length ?? 0;
                        const available = slots > 0 && !isLoading;
                        const selected = date === selectedDate && available;
                        const isToday = date === today;

                        return (
                          <button
                            key={date}
                            type="button"
                            disabled={!available}
                            onClick={() => chooseDate(date)}
                            className={`relative flex min-h-[42px] w-full items-center justify-center rounded-lg border-2 border-white px-[0.8em] py-[0.7em] text-base font-medium ${
                              selected
                                ? "bg-[#ff7900] text-white"
                                : available
                                  ? "bg-[#b7dcc8] hover:brightness-95"
                                  : "bg-transparent text-[#d1d5db]"
                            }`}
                          >
                            {day}
                            {isToday && !selected ? (
                              <span className="absolute bottom-1 left-1/2 h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-[#1e3a8a]" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0 md:pl-6">
                    <div className="mb-2.5 flex items-center justify-between gap-2">
                      <p className="font-semibold">{shortDate(selectedDate)}</p>
                      <div
                        role="group"
                        aria-label="Time format"
                        className="inline-flex rounded-full bg-[#f3f4f6] p-0.5"
                      >
                        <button
                          type="button"
                          aria-pressed={!hour24}
                          onClick={() => setHour24(false)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            hour24
                              ? "text-[#6b7280]"
                              : "bg-[#111827] text-white"
                          }`}
                        >
                          AM/PM
                        </button>
                        <button
                          type="button"
                          aria-pressed={hour24}
                          onClick={() => setHour24(true)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            hour24
                              ? "bg-[#111827] text-white"
                              : "text-[#6b7280]"
                          }`}
                        >
                          24h
                        </button>
                      </div>
                    </div>

                    {isLoading ? (
                      <div className="h-36 animate-pulse rounded-xl bg-[#edeef1]" />
                    ) : loadError ? (
                      <button
                        type="button"
                        onClick={() => setReloadKey((key) => key + 1)}
                        className="w-full rounded-xl border border-dashed border-[#d1d5db] px-4 py-8 text-sm"
                      >
                        Could not load times. Try again.
                      </button>
                    ) : selectedDay && selectedDay.slots.length > 0 ? (
                      <div className="flex max-h-[58vh] flex-col gap-2 overflow-y-auto">
                        {selectedDay.slots.map((slot) => {
                          const selected = slot.startTime === selectedStart;
                          return (
                            <button
                              key={slot.startTime}
                              type="button"
                              onClick={() => openDetails(slot)}
                              className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm ${
                                selected
                                  ? "border-[#ff7900] bg-[#fff4eb]"
                                  : "border-[#e5e7eb] hover:border-[#b7dcc8]"
                              }`}
                            >
                              <span>{formatRange(slot, hour24)}</span>
                              <span className="text-xs text-[#6b7280]">
                                {slot.availableSlots}{" "}
                                {slot.availableSlots === 1 ? "spot" : "spots"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-[#d1d5db] px-6 py-8 text-center">
                        <p className="text-[1.05em] font-semibold">
                          No timeslots available
                        </p>
                        <p className="mt-1 text-sm text-[#6b7280]">
                          Please select another date
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : step === "confirmed" && booked ? (
              <AddedToCart
                booked={booked}
                today={today}
                checkoutUrl={booked.checkoutUrl}
              />
            ) : selectedSlot ? (
              <SelectedTime
                date={selectedDate}
                slot={selectedSlot}
                eventLabel={`${product.title} Event`}
                location={monthData?.location || "Pilestraede 39, Copenhagen"}
                minimumAttendees={minimumAttendees}
                quantity={quantity}
                setQuantity={setQuantity}
                answers={answers}
                touched={touched}
                setAnswer={(id, value) =>
                  setAnswers((current) => ({ ...current, [id]: value }))
                }
                touch={(id) =>
                  setTouched((current) => ({ ...current, [id]: true }))
                }
                canAdd={Boolean(variant) && answersReady && !isPending}
                isPending={isPending}
                submitError={submitError}
                onAdd={reserve}
              />
            ) : null}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
