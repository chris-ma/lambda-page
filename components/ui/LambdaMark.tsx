import { cn } from "@/lib/utils";

/**
 * The λ mark — a plain ink-on-paper plaque, never used as a static logo.
 * Square, not circular — no ring, no mustard, no hatch texture.
 * `badge` is the small recurring mark (nav, footer, function strip).
 * `plate` is the full hero specimen plate with a straight-line caption.
 */
export function LambdaMark({
  variant = "badge",
  size = 44,
  className,
}: {
  variant?: "badge" | "plate";
  size?: number;
  className?: string;
}) {
  if (variant === "plate") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        className={className}
        aria-hidden="true"
      >
        <rect
          x="8"
          y="8"
          width="144"
          height="144"
          fill="none"
          stroke="#171717"
          strokeWidth="1.5"
          strokeDasharray="1 5"
        />
        <g style={{ transformOrigin: "80px 76px" }}>
          <rect x="34" y="30" width="92" height="92" fill="#fafafa" />
          <rect x="34" y="30" width="92" height="92" fill="none" stroke="#171717" strokeWidth="2" />
          <text
            x="80"
            y="97"
            fontFamily="var(--font-display)"
            fontWeight="700"
            fontSize="46"
            fill="#171717"
            textAnchor="middle"
          >
            λ
          </text>
        </g>
        <text
          x="80"
          y="145"
          fontFamily="var(--font-mono)"
          fontSize="8.5"
          letterSpacing="2.5"
          fill="#171717"
          textAnchor="middle"
        >
          LANDING PAGE FUNCTION
        </text>
      </svg>
    );
  }

  return (
    <div
      className={cn("group relative inline-flex shrink-0 items-center justify-center font-display font-bold text-ink", className)}
      style={{ width: size, height: size, fontSize: size * 0.46 }}
      aria-hidden="true"
    >
      {/* λ already reads as a "y" in this typeface — spin it upside down and let "es" slide out beside it, so the mark reveals "Yes" on hover.
          "es" is positioned off the glyph's own shrink-wrapped box (this inner span), not the outer fixed-size container — anchoring it to
          the container left a wide empty gap, since the container is padded well past the glyph to keep a consistent layout footprint. */}
      <span className="relative inline-block">
        <span className="inline-block transition-transform duration-500 [transition-timing-function:cubic-bezier(.2,.8,.3,1.3)] group-hover:rotate-180">
          λ
        </span>
        <span
          className="pointer-events-none absolute top-1/2 left-full -translate-x-1 -translate-y-1/2 whitespace-nowrap opacity-0 transition-all duration-500 [transition-timing-function:cubic-bezier(.2,.8,.3,1.3)] group-hover:translate-x-0 group-hover:opacity-100"
          style={{ fontSize: size * 0.46 }}
        >
          es
        </span>
      </span>
    </div>
  );
}
