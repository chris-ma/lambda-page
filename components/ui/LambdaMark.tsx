import { cn } from "@/lib/utils";

/**
 * The λ mark — a hatch-filled mustard plaque, never used as a static logo.
 * `badge` is the small recurring mark (nav, footer, function strip).
 * `plate` is the full hero specimen plate with the outer rings + circular caption.
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
            <line x1="0" y1="0" x2="0" y2="6" stroke="#332A22" strokeWidth="1" opacity="0.4" />
          </pattern>
          <path
            id="lp-circle-path"
            d="M 80,80 m -66,0 a 66,66 0 1,1 132,0 a 66,66 0 1,1 -132,0"
          />
        </defs>
        <circle
          cx="80"
          cy="80"
          r="72"
          fill="none"
          stroke="#332A22"
          strokeWidth="1.5"
          strokeDasharray="1 5"
        />
        <circle cx="80" cy="80" r="60" fill="none" stroke="#332A22" strokeWidth="1" />
        <g style={{ transformOrigin: "80px 80px" }}>
          <circle cx="80" cy="80" r="46" fill="#D9A441" />
          <circle cx="80" cy="80" r="46" fill="url(#lp-hatch)" />
          <circle cx="80" cy="80" r="46" fill="none" stroke="#332A22" strokeWidth="2" />
          <text
            x="80"
            y="97"
            fontFamily="var(--font-display)"
            fontWeight="700"
            fontSize="46"
            fill="#332A22"
            textAnchor="middle"
          >
            λ
          </text>
        </g>
        <text fontFamily="var(--font-mono)" fontSize="8.5" letterSpacing="2.5" fill="#332A22">
          <textPath href="#lp-circle-path" startOffset="50%" textAnchor="middle">
            LANDING PAGE FUNCTION
          </textPath>
        </text>
      </svg>
    );
  }

  return (
    <div
      className={cn(
        "hatch-fill texture inline-flex shrink-0 items-center justify-center rounded-full border-2 border-ink bg-mustard font-display font-bold text-ink shadow-depth-xs transition-transform duration-500 [transition-timing-function:cubic-bezier(.2,.8,.3,1.3)] hover:rotate-180",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.46 }}
      aria-hidden="true"
    >
      λ
    </div>
  );
}
