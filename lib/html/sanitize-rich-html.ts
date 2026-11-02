/**
 * Strip script injection from CMS HTML while leaving formatting, images,
 * classes, and styles in place so existing pages render the same.
 */
export function sanitizeRichHtml(html: string): string {
  if (!html) return html;

  let safe = html.replace(
    /<\s*(script|object|embed|form|base)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
    "",
  );
  safe = safe.replace(
    /<\s*(script|object|embed|form|base)\b[^>]*\/?\s*>/gi,
    "",
  );
  safe = safe.replace(/\s+on[a-z0-9]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  safe = safe.replace(
    /(\s(?:href|src)\s*=\s*)(["'])\s*(?:javascript|vbscript):[^"']*\2/gi,
    '$1"#"',
  );

  return safe;
}
