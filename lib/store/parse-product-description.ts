function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/gi, " ");
}

function htmlToPlainLines(descriptionHtml: string): string[] {
  const text = decodeHtmlEntities(descriptionHtml)
    .replace(/<meta[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "");

  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseProductDescriptionLines(
  description: string,
  descriptionHtml: string,
): string[] {
  if (descriptionHtml?.trim()) {
    const lines = htmlToPlainLines(descriptionHtml);
    if (lines.length) return lines;
  }

  return description
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}
