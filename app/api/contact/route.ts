import { createFreshdeskTicket } from "lib/freshdesk";
import { NextRequest, NextResponse } from "next/server";

type ContactPayload = {
  fullName?: unknown;
  email?: unknown;
  orderNumber?: unknown;
  message?: unknown;
};

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_ORDER_LENGTH = 64;
const MAX_MESSAGE_LENGTH = 5000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 8;

const recentSubmissions = new Map<string, number[]>();

function clientKey(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip")?.trim() || "unknown";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (recentSubmissions.get(key) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  if (recent.length >= RATE_LIMIT_MAX) {
    recentSubmissions.set(key, recent);
    return true;
  }

  recent.push(now);
  recentSubmissions.set(key, recent);
  return false;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: ContactPayload;

  try {
    body = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const fullName = asTrimmedString(body.fullName);
  const email = asTrimmedString(body.email);
  const orderNumber = asTrimmedString(body.orderNumber);
  const message = asTrimmedString(body.message);

  if (!fullName || !email || !orderNumber || !message) {
    return NextResponse.json(
      { error: "Please fill in all required fields." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  if (
    fullName.length > MAX_NAME_LENGTH ||
    email.length > MAX_EMAIL_LENGTH ||
    orderNumber.length > MAX_ORDER_LENGTH ||
    message.length > MAX_MESSAGE_LENGTH
  ) {
    return NextResponse.json(
      { error: "One of the fields is too long." },
      { status: 400 },
    );
  }

  if (isRateLimited(clientKey(req))) {
    return NextResponse.json(
      { error: "Please wait a few minutes before sending another message." },
      { status: 429 },
    );
  }

  if (!process.env.FRESHDESK_API_KEY?.trim()) {
    console.error("FRESHDESK_API_KEY is not configured");
    return NextResponse.json(
      {
        error: "Contact form is not configured yet. Please try again later.",
      },
      { status: 503 },
    );
  }

  const subject = `Contact form — ${fullName} — Order ${orderNumber}`;
  const description = [
    `Full name: ${fullName}`,
    `Email: ${email}`,
    `Order number: ${orderNumber}`,
    "",
    "Message:",
    message,
  ].join("\n");

  try {
    const result = await createFreshdeskTicket({
      email,
      name: fullName,
      subject,
      description,
    });

    if (!result.ok) {
      console.error("Freshdesk error:", result.status, result.detail);
      return NextResponse.json(
        { error: "Failed to send message. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact form send failed:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 502 },
    );
  }
}
