/** WCAG 2.1 relative luminance + contrast ratio, computed directly from the formula. */

function srgbChannel(c: number): number {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function relativeLuminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b);
}

export function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Parses `rgb(r,g,b)` / `rgba(r,g,b,a)` computed-style strings. Returns null for transparent. */
export function parseRgb(input: string): [number, number, number] | null {
  const m = input.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/i);
  if (!m) return null;
  const alpha = m[4] !== undefined ? parseFloat(m[4]) : 1;
  if (alpha === 0) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
}

/** Flattens a possibly-transparent foreground/background pair onto white, the common case for text over an image-less page. */
export function blendOverWhite(rgb: [number, number, number], alpha: number): [number, number, number] {
  return [
    Math.round(rgb[0] * alpha + 255 * (1 - alpha)),
    Math.round(rgb[1] * alpha + 255 * (1 - alpha)),
    Math.round(rgb[2] * alpha + 255 * (1 - alpha)),
  ];
}

export function passesAA(ratio: number, isLargeText: boolean): boolean {
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}
