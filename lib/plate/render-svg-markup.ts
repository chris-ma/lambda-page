import type { PlateGeometry } from "./funnel-plate";

// Static hex approximations of the on-screen OKLCH ramp, used only for the
// rasterized OG export — a PNG can't carry CSS custom properties, so this
// is the one place the palette is baked to literal color values. The
// numbers driving the shape are identical to the interactive plate.
const RAMP_HEX = ["#cfe0f0", "#9dc2e6", "#6fa3d9", "#4a80c2", "#35619e"];
const FAILING_HEX = "#e2542f";

function rampHex(index: number, total: number): string {
  const t = total <= 1 ? 0 : index / (total - 1);
  return RAMP_HEX[Math.round(t * (RAMP_HEX.length - 1))];
}

/**
 * Serializes plate geometry to a standalone SVG string — same `band.path`
 * data the interactive <FunnelPlate> draws, just rasterized for the OG
 * image instead of hydrated in the browser. Not a redrawn mockup.
 */
export function funnelPlateSvgMarkup(geometry: PlateGeometry, opts: { ink?: string } = {}): string {
  const ink = opts.ink ?? "#f2f4f7";
  const bandEls = geometry.bands
    .map(
      (band) => `<path d="${band.path}" fill="${band.failing ? FAILING_HEX : rampHex(band.index, geometry.bands.length)}" />`,
    )
    .join("");
  const nodeEls = geometry.nodes
    .map(
      (node) =>
        `<rect x="${node.x - 2.5}" y="${geometry.centerY - node.halfHeight}" width="5" height="${node.halfHeight * 2}" fill="${ink}" />`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${geometry.width} ${geometry.height}" width="${geometry.width}" height="${geometry.height}">${bandEls}${nodeEls}</svg>`;
}
