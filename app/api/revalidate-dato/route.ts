import { datoCacheTag } from "lib/cms/datocms";
import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

type DatoWebhookBody = {
  cache_tags?: unknown;
  entity?: {
    attributes?: { slug?: unknown };
  };
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function webhookSecret(): string | undefined {
  return process.env.DATOCMS_WEBHOOK_SECRET?.trim() || undefined;
}

function secretMatches(
  provided: string | undefined,
  expected: string | undefined,
): boolean {
  if (!provided || !expected) return false;

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

function readSecret(req: NextRequest): string | undefined {
  return (
    req.headers.get("x-datocms-webhook-secret")?.trim() ||
    req.nextUrl.searchParams.get("secret")?.trim() ||
    undefined
  );
}

function normalizeCacheTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeSlug(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const slug = value.trim().toLowerCase();
  if (!slug || !SLUG_PATTERN.test(slug)) return undefined;

  return slug;
}

async function parseBody(req: NextRequest): Promise<DatoWebhookBody> {
  try {
    const text = await req.text();
    if (!text) return {};
    return JSON.parse(text) as DatoWebhookBody;
  } catch {
    return {};
  }
}

function safeRevalidateTag(tag: string): boolean {
  try {
    revalidateTag(tag, "seconds");
    return true;
  } catch (error) {
    console.error("[revalidate-dato] revalidateTag failed:", tag, error);
    return false;
  }
}

function safeRevalidatePath(path: string, type?: "layout" | "page"): boolean {
  try {
    if (type) {
      revalidatePath(path, type);
    } else {
      revalidatePath(path);
    }
    return true;
  } catch (error) {
    console.error("[revalidate-dato] revalidatePath failed:", path, error);
    return false;
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const configuredSecret = webhookSecret();
  if (!configuredSecret) {
    return NextResponse.json(
      { error: "Webhook not configured", revalidated: false },
      { status: 503 },
    );
  }

  const secret = readSecret(req);
  if (!secretMatches(secret, configuredSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await parseBody(req);
    const cacheTags = normalizeCacheTags(body.cache_tags);
    const slug = normalizeSlug(body.entity?.attributes?.slug);

    const revalidatedTags: string[] = [];
    const failedTags: string[] = [];
    const revalidatedPaths: string[] = [];
    const failedPaths: string[] = [];

    for (const tag of cacheTags) {
      (safeRevalidateTag(tag) ? revalidatedTags : failedTags).push(tag);
    }

    const globalTag = datoCacheTag();
    (safeRevalidateTag(globalTag) ? revalidatedTags : failedTags).push(
      globalTag,
    );
    (safeRevalidateTag("dato:coffee-farms")
      ? revalidatedTags
      : failedTags
    ).push("dato:coffee-farms");

    const paths = [
      "/",
      "/projects",
      "/partners",
      "/shops",
      "/collections/all",
      "/coffee-inf-recipes",
    ];
    if (slug) {
      paths.push(`/projects/${slug}`);
      paths.push(`/partners/${slug}`);
      paths.push(`/shops/${slug}`);
      paths.push(`/range/${slug}`);
      paths.push(`/range/${slug}/product/${slug}`);
      paths.push(`/coffee-inf-recipes/${slug}`);
    }

    for (const path of paths) {
      (safeRevalidatePath(path) ? revalidatedPaths : failedPaths).push(path);
    }

    if (!safeRevalidatePath("/", "layout")) {
      failedPaths.push("/ (layout)");
    } else {
      revalidatedPaths.push("/ (layout)");
    }

    const hasFailures = failedTags.length > 0 || failedPaths.length > 0;

    return NextResponse.json({
      revalidated: !hasFailures,
      partial:
        hasFailures &&
        (revalidatedTags.length > 0 || revalidatedPaths.length > 0),
      slug: slug ?? null,
      revalidatedTags,
      revalidatedPaths,
      ...(failedTags.length ? { failedTags } : {}),
      ...(failedPaths.length ? { failedPaths } : {}),
      now: Date.now(),
    });
  } catch (error) {
    console.error("[revalidate-dato] unhandled error:", error);

    return NextResponse.json(
      { error: "Revalidation failed", revalidated: false },
      { status: 500 },
    );
  }
}
