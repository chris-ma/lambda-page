import { cn } from "@/lib/utils";

/**
 * The λ mark — a hatch-filled ink-on-paper plaque, never used as a static
 * logo. Square, not circular — no ring, no mustard; the engraved-plate hatch
 * texture is the signature detail instead of a color.
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
        <defs>
          <pattern
            id="lp-hatch"
            width="6"
            height="6"
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="6" stroke="#171717" strokeWidth="1" opacity="0.4" />
          </pattern>
        </defs>
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
          <rect x="34" y="30" width="92" height="92" fill="url(#lp-hatch)" />
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
      className={cn(
        "hatch-fill inline-flex shrink-0 items-center justify-center border-2 border-ink bg-cream font-display font-bold text-ink transition-transform duration-500 [transition-timing-function:cubic-bezier(.2,.8,.3,1.3)] hover:rotate-180",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.46 }}
      aria-hidden="true"
    >
      λ
    </div>
  );
}
