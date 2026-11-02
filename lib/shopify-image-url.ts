export function shopifyImageUrl(url: string, width: number): string {
  const base = url.split("?")[0];
  return `${base}?width=${width}`;
}
