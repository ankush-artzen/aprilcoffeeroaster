import { SERVICIFY_API_URL, TASTING_MENU_TIMEZONE } from "lib/constants";
import { TASTING_BOOKING_FIELDS } from "lib/tasting-menu/fields";
import type {
  CartAttribute,
  TastingDay,
  TastingMonth,
  TastingSlot,
} from "lib/tasting-menu/types";

const TIMEZONE = TASTING_MENU_TIMEZONE;

type Employee = {
  id: number;
  regularHours: Record<string, string[]>;
  specialHours?: Record<string, string[]>;
};

type TastingEvent = {
  id: number;
  name: string;
  numAttendees: number;
  location: string;
  minimumAttendees: number;
  leadTime?: { unit?: string; duration?: number };
  employees: Employee[];
};

type BusyBooking = {
  quantity?: number;
  date?: {
    startTime?: string;
    startDateString?: string;
  };
};

function numericId(id: string) {
  const value = id.split("/").pop() ?? "";
  if (!/^\d+$/.test(value)) {
    throw new Error("Missing product variant.");
  }
  return value;
}

function formatClock(hours: number, minutes: number) {
  const suffix = hours >= 12 ? "pm" : "am";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function displayTime(startTime: string) {
  return startTime.replace(/am|pm/, (part) => part.toUpperCase());
}

function ordinal(day: number) {
  const mod100 = day % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${day}th`;
  if (day % 10 === 1) return `${day}st`;
  if (day % 10 === 2) return `${day}nd`;
  if (day % 10 === 3) return `${day}rd`;
  return `${day}th`;
}

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

function formatStartDate(date: string) {
  const instant = new Date(`${date}T12:00:00Z`);
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "UTC",
  }).format(instant);
  const month = new Intl.DateTimeFormat("en-US", {
    month: "long",
    timeZone: "UTC",
  }).format(instant);

  return `${weekday}, ${month} ${ordinal(Number(date.slice(-2)))} ${date.slice(0, 4)}`;
}

function parseHourRange(range: string) {
  const match = range.trim().match(/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const startHour = Number(match[1]);
  const startMinute = Number(match[2]);

  return {
    startTime: formatClock(startHour, startMinute),
    endTime: formatClock(Number(match[3]), Number(match[4])),
    startHour,
    startMinute,
  };
}

function weekdayName(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "long",
  }).format(new Date(`${date}T12:00:00Z`));
}

function zonedTimeToUtc(date: string, hours: number, minutes: number) {
  const guess = new Date(
    `${date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00Z`,
  );
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TIMEZONE,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(guess)
      .map((part) => [part.type, part.value]),
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return new Date(guess.getTime() - (asUtc - guess.getTime()));
}

function leadTimeMs(event: TastingEvent) {
  const duration = event.leadTime?.duration ?? 0;
  const unit = event.leadTime?.unit ?? "days";
  if (unit === "hours") return duration * 60 * 60 * 1000;
  if (unit === "minutes") return duration * 60 * 1000;
  return duration * 24 * 60 * 60 * 1000;
}

function copenhagenToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function addCalendarDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

// Servicify disables the next `duration` calendar days when lead time is in days,
// on top of the rolling notice check for each slot.
function isInsideDayLeadTime(event: TastingEvent, date: string) {
  const leadTime = event.leadTime;
  if (!leadTime || leadTime.unit !== "days") return false;
  const duration = leadTime.duration ?? 0;
  if (duration <= 0) return false;

  const today = copenhagenToday();
  return date > today && date <= addCalendarDays(today, duration);
}

function rangesForDate(employee: Employee, date: string) {
  const special = employee.specialHours?.[date];
  const ranges = special ?? employee.regularHours[weekdayName(date)] ?? [];
  return ranges.map((range) => range.trim()).filter(Boolean);
}

let cachedEvent: { variantId: string; event: TastingEvent; at: number } | null =
  null;

async function getTastingEvent(variantId: string) {
  const id = numericId(variantId);
  if (
    cachedEvent &&
    cachedEvent.variantId === id &&
    Date.now() - cachedEvent.at < 5 * 60 * 1000
  ) {
    return cachedEvent.event;
  }

  const response = await fetch(
    `${SERVICIFY_API_URL}/api/variants/${id}/events`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Could not load tasting menu times.");
  }

  const event = (await response.json()) as TastingEvent & {
    status?: string;
    message?: string;
    dates?: unknown;
    location?: string;
    minimumAttendeesPerTimeslot?: number;
    customFields?: number[];
  };
  const employee = event.employees?.[0];

  console.log("[april-tasting-menu] servicify event", {
    variantId: id,
    httpStatus: response.status,
    eventId: event.id ?? null,
    status: event.status ?? null,
    message: event.message ?? null,
    employeeId: employee?.id ?? null,
    customFields: event.customFields ?? null,
  });

  if (!event.id || !employee) {
    throw new Error("Could not load tasting menu times.");
  }

  const slim = {
    id: event.id,
    name: event.name,
    numAttendees: event.numAttendees || 1,
    location: event.location || "Pilestraede 39, Copenhagen",
    minimumAttendees: event.minimumAttendeesPerTimeslot || 1,
    leadTime: event.leadTime,
    employees: [
      {
        id: employee.id,
        regularHours: employee.regularHours ?? {},
        specialHours: employee.specialHours,
      },
    ],
  } satisfies TastingEvent;
  cachedEvent = { variantId: id, event: slim, at: Date.now() };
  return slim;
}

async function fetchBusyBookings(
  event: TastingEvent,
  dateFrom: string,
  dateTo: string,
) {
  const employeeIds = event.employees.map((employee) => employee.id);
  const response = await fetch(
    `${SERVICIFY_API_URL}/api/events/${event.id}/employees/busy-slots`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        employeeIds,
        dateFrom,
        dateTo,
        inputTimezone: TIMEZONE,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Could not load booked times.");
  }

  const body = (await response.json()) as {
    bookings?: Record<string, BusyBooking[]>;
  };

  return employeeIds.flatMap((id) => body.bookings?.[String(id)] ?? []);
}

function slotsForDate(
  event: TastingEvent,
  date: string,
  bookings: BusyBooking[],
): TastingSlot[] {
  const employee = event.employees[0];
  if (!employee || isInsideDayLeadTime(event, date)) return [];

  const earliest = Date.now() + leadTimeMs(event);

  return rangesForDate(employee, date).flatMap((range) => {
    const parsed = parseHourRange(range);
    if (!parsed) return [];

    const startsAt = zonedTimeToUtc(date, parsed.startHour, parsed.startMinute);
    if (startsAt.getTime() < earliest) return [];

    const booked = bookings
      .filter(
        (booking) =>
          booking.date?.startDateString === date &&
          booking.date.startTime === parsed.startTime,
      )
      .reduce((total, booking) => total + (booking.quantity ?? 1), 0);
    const availableSlots = event.numAttendees - booked;
    if (availableSlots <= 0) return [];

    return [
      {
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        availableSlots,
      },
    ];
  });
}

function daysInMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  if (!year || !monthNumber) return [];

  const count = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return Array.from({ length: count }, (_, index) => {
    return `${month}-${String(index + 1).padStart(2, "0")}`;
  });
}

async function monthFromEvent(
  event: TastingEvent,
  month: string,
): Promise<TastingMonth> {
  const dates = daysInMonth(month);
  const bookings = await fetchBusyBookings(
    event,
    dates[0] ?? `${month}-01`,
    dates.at(-1) ?? `${month}-01`,
  );
  const days: TastingDay[] = dates.map((date) => ({
    date,
    slots: slotsForDate(event, date, bookings),
  }));

  return {
    month,
    eventName: event.name,
    location: event.location,
    minimumAttendees: event.minimumAttendees,
    days,
  };
}

export async function getTastingMonth(
  variantId: string,
  month: string,
): Promise<TastingMonth> {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new Error("Invalid month.");
  }

  return monthFromEvent(await getTastingEvent(variantId), month);
}

export async function holdTastingSlot(input: {
  variantId: string;
  productTitle: string;
  date: string;
  startTime: string;
  quantity: number;
  answers: Record<string, string>;
}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new Error("Choose a date.");
  }

  const event = await getTastingEvent(input.variantId);
  const bookings = await fetchBusyBookings(event, input.date, input.date);
  const slot = slotsForDate(event, input.date, bookings).find(
    (item) => item.startTime === input.startTime,
  );

  if (
    !slot ||
    input.quantity < event.minimumAttendees ||
    input.quantity > slot.availableSlots
  ) {
    throw new Error("That time is no longer available.");
  }

  const employee = event.employees[0];
  if (!employee) {
    throw new Error("Could not reserve this time.");
  }

  const properties: Record<string, string | number> = {
    "_Event #": event.id,
    "_Booking Timezone": TIMEZONE,
    _Lang: "en",
    Date: formatDateLabel(input.date),
    Time: displayTime(slot.startTime),
    "_Start Date": formatStartDate(input.date),
    "_Start Time": slot.startTime,
    "_End Time": slot.endTime,
    "_Booked With": `${input.productTitle} Event   - ${employee.id}`,
  };

  for (const field of TASTING_BOOKING_FIELDS) {
    const value = input.answers[String(field.id)]?.trim();
    if (!value) throw new Error("This field is required.");
    properties[`_${field.label}__${field.id}`] = value;
  }

  const response = await fetch(
    `${SERVICIFY_API_URL}/api/events/${event.id}/bookings/temporary`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        quantity: input.quantity,
        eventId: event.id,
        productId: numericId(input.variantId),
        properties,
        selectedTime: {
          date: input.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          availableSlots: slot.availableSlots,
          timezone: TIMEZONE,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error("That time is no longer available.");
  }

  const body = (await response.json()) as {
    miniSlug?: string;
    expiresAt?: string;
  };

  const lineAttributes: CartAttribute[] = Object.entries(properties).map(
    ([key, value]) => ({ key, value: String(value) }),
  );

  if (body.miniSlug) {
    lineAttributes.push({ key: "_ID", value: body.miniSlug });
  }
  if (body.expiresAt) {
    lineAttributes.push({ key: "_ExpiresAt", value: body.expiresAt });
  }

  return {
    lineAttributes,
    cartAttributes: [{ key: "__Servicify Appointment", value: "Yes" }],
  };
}
