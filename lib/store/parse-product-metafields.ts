import { sanitizeRichHtml } from "lib/html/sanitize-rich-html";
import { parseProductDescriptionLines } from "lib/store/parse-product-description";

export type ParsedInfoLink = {
  href: string;
  label: string;
  external: boolean;
};

export type SizeChartMeasurement = {
  name: string;
  measures: string[];
};

export type SizeChartData = {
  variantNames: string[];
  measurements: SizeChartMeasurement[];
  footerNotes: string[];
};

export type ParsedTechnicalDetails = {
  lines: string[];
  html: string | null;
};

export type ParsedSizeChart = {
  table: SizeChartData | null;
  plainText: string | null;
};

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/gi, " ");
}

function splitBulletText(text: string): string[] {
  return text
    .split(/\s*•\s*|\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function defaultInfoLinkLabel(href: string): string {
  if (/coffee-inf-recipes/i.test(href)) {
    return "View Coffee Info";
  }

  return "View Product Info";
}

/**
 * Product Details CTA from Shopify metafields `custom.info_link` (+ optional
 * `custom.info_link_label`). Accepts site paths
 * (`/coffee-inf-recipes/volcan-azul`, `/product/coffee-grinder`), bare coffee-info
 * slugs (`volcan-azul`), or absolute URLs.
 */
export function parseInfoLink(
  url: string | null | undefined,
  label?: string | null | undefined,
): ParsedInfoLink | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  let href: string;
  let external = false;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      // Validate absolute URL shape.
      new URL(trimmed);
    } catch {
      return null;
    }
    href = trimmed;
    external = true;
  } else if (trimmed.startsWith("/")) {
    href = trimmed;
  } else if (
    trimmed.startsWith("coffee-inf-recipes") ||
    trimmed.startsWith("product/")
  ) {
    href = `/${trimmed}`;
  } else {
    // Treat bare slugs as coffee-info farm pages (primary coffee use case).
    href = `/coffee-inf-recipes/${trimmed.replace(/^\/+/, "")}`;
  }

  return {
    href,
    label: label?.trim() || defaultInfoLinkLabel(href),
    external,
  };
}

export function parseTechnicalDetails(
  value: string | null | undefined,
): ParsedTechnicalDetails | null {
  if (!value?.trim()) return null;

  const trimmed = value.trim();

  if (trimmed.includes("<")) {
    const lines = parseProductDescriptionLines("", trimmed);
    return {
      lines,
      html: sanitizeRichHtml(trimmed),
    };
  }

  const lines = splitBulletText(trimmed);
  if (lines.length === 0) return null;

  const detailLines =
    lines.length > 1 && lines[0]?.toUpperCase().endsWith(" DETAILS")
      ? lines.slice(1)
      : lines;

  return {
    lines: detailLines,
    html: null,
  };
}

/** Multi-line / rich-text recipe body from Shopify metafields. */
export type ParsedRecipeContent = ParsedTechnicalDetails;

const LONG_PROSE_CHAR_THRESHOLD = 280;
const SENTENCES_PER_PARAGRAPH = 2;

/** Fix missing spaces after sentence-ending periods (e.g. "century.The"). */
function normalizeSentenceSpacing(text: string): string {
  return text.replace(/([a-z0-9])\.([A-Z])/g, "$1. $2");
}

function splitIntoSentences(text: string): string[] {
  const normalized = normalizeSentenceSpacing(text).trim();
  if (!normalized) return [];

  return normalized
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

/**
 * When Shopify stores supplier/prose copy as one unbroken block, split it into
 * short paragraphs (pairs of sentences) so the accordion isn't a wall of text.
 * Already-broken multi-line content is left alone.
 */
function splitLongProseBlock(text: string): string[] | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed.includes("\n") || trimmed.includes("•")) return null;
  if (trimmed.length < LONG_PROSE_CHAR_THRESHOLD) return null;

  const sentences = splitIntoSentences(trimmed);
  if (sentences.length < 2) return null;

  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += SENTENCES_PER_PARAGRAPH) {
    paragraphs.push(sentences.slice(i, i + SENTENCES_PER_PARAGRAPH).join(" "));
  }

  return paragraphs.length > 1 ? paragraphs : null;
}

export function parseRecipeContent(
  value: string | null | undefined,
): ParsedRecipeContent | null {
  if (!value?.trim()) return null;

  const trimmed = value.trim();

  if (trimmed.includes("<")) {
    return parseTechnicalDetails(trimmed);
  }

  const proseParagraphs = splitLongProseBlock(trimmed);
  if (proseParagraphs) {
    return {
      lines: proseParagraphs,
      html: null,
    };
  }

  return parseTechnicalDetails(trimmed);
}

export function parseSizeChart(
  value: string | null | undefined,
): ParsedSizeChart | null {
  if (!value?.trim()) return null;

  const trimmed = value.trim();

  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as {
        measurements?: Array<{ name?: string; measures?: string[] }>;
        variant_names?: string[];
      };

      const variantNames = parsed.variant_names?.filter(Boolean) ?? [];
      const measurements =
        parsed.measurements
          ?.filter((item) => item.name && item.measures?.length)
          .map((item) => ({
            name: item.name!,
            measures: item.measures!,
          })) ?? [];

      if (variantNames.length > 0 && measurements.length > 0) {
        return {
          table: {
            variantNames,
            measurements,
            footerNotes: [],
          },
          plainText: null,
        };
      }
    } catch (error) {
      console.error(error);
    }
  }

  const plainTextTable = parsePlainTextSizeChart(trimmed);
  if (plainTextTable) {
    return {
      table: plainTextTable,
      plainText: null,
    };
  }

  return {
    table: null,
    plainText: decodeHtmlEntities(trimmed),
  };
}

const PLAIN_TEXT_SIZE_CHART_MEASUREMENTS = [
  "Body Length",
  "Sleeve Length",
  "Chest",
  "Waist",
  "Hem",
];

function parsePlainTextSizeChart(text: string): SizeChartData | null {
  const footerMatch = text.match(/(ALL MEASUREMENTS[\s\S]*)$/i);
  const footerNotes = footerMatch?.[1]?.trim()
    ? footerMatch[1]
        .trim()
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
    : [];
  const body =
    footerMatch && footerMatch.index != null
      ? text.slice(0, footerMatch.index).trim()
      : text;

  const found = PLAIN_TEXT_SIZE_CHART_MEASUREMENTS.flatMap((name) => {
    const index = body.indexOf(name);
    return index >= 0 ? [{ name, index }] : [];
  }).sort((a, b) => a.index - b.index);

  const firstMeasurement = found[0];
  if (!firstMeasurement) return null;

  const variantNames = body
    .slice(0, firstMeasurement.index)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (variantNames.length === 0) return null;

  const measurements: SizeChartMeasurement[] = [];

  for (let index = 0; index < found.length; index += 1) {
    const current = found[index];
    if (!current) continue;

    const next = found[index + 1];
    const start = current.index + current.name.length;
    const end = next ? next.index : body.length;
    const measures = body.slice(start, end).trim().split(/\s+/).filter(Boolean);

    if (measures.length === 0) continue;

    measurements.push({
      name: current.name,
      measures,
    });
  }

  if (measurements.length === 0) return null;

  return {
    variantNames,
    measurements,
    footerNotes,
  };
}
