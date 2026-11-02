const DEFAULT_FRESHDESK_DOMAIN = "aprilcoffeeroastery.freshdesk.com";

type CreateTicketInput = {
  email: string;
  name: string;
  subject: string;
  description: string;
};

type CreateTicketResult =
  | { ok: true; ticketId: number }
  | { ok: false; status?: number; detail?: unknown };

export async function createFreshdeskTicket(
  input: CreateTicketInput,
): Promise<CreateTicketResult> {
  const apiKey = process.env.FRESHDESK_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false };
  }

  const domain =
    process.env.FRESHDESK_DOMAIN?.trim() || DEFAULT_FRESHDESK_DOMAIN;
  const auth = Buffer.from(`${apiKey}:X`).toString("base64");

  const response = await fetch(`https://${domain}/api/v2/tickets`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      name: input.name,
      subject: input.subject,
      description: input.description,
      priority: 1,
      status: 2,
    }),
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    return { ok: false, status: response.status, detail };
  }

  const data = (await response.json()) as { id?: number };
  if (typeof data.id !== "number") {
    return { ok: false, status: response.status, detail: data };
  }

  return { ok: true, ticketId: data.id };
}
