import { ImageResponse } from "next/og";
import { computeFunnelPlateGeometry } from "@/lib/plate/funnel-plate";
import { funnelPlateSvgMarkup } from "@/lib/plate/render-svg-markup";
import { HEALTHY_FUNNEL } from "@/lib/plate/demo-specs";

export const alt = "A funnel plate generated live from diagnostic data — page_view through form_submit, stage volume and drop-off drawn directly from the numbers.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The OG image is the same generative renderer the product uses, not a
// designed mockup: it runs the identical geometry function the hero plate
// runs, then rasterizes the same path data.
export default function Image() {
  const geometry = computeFunnelPlateGeometry(HEALTHY_FUNNEL);
  const svg = funnelPlateSvgMarkup(geometry);
  const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const scale = Math.min(900 / geometry.width, 300 / geometry.height);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#13161b",
          padding: "56px 64px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", color: "#8a94a3", fontSize: 22 }}>
          <span>Fig. 01</span>
          <span>Landing page function</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img src={dataUri} width={Math.round(geometry.width * scale)} height={Math.round(geometry.height * scale)} alt="" />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", color: "#8a94a3", fontSize: 20 }}>
          <span>Lambda</span>
          <span>page_view to form_submit — drawn from live diagnostic data</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
