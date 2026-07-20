export type PillarId = 0 | 1 | 2 | 3;

/**
 * A single highlight color — terracotta — used everywhere a pillar needs an
 * accent, on marketing surfaces only (homepage, /pillars, nav). Previously
 * cycled through four different hues per pillar; collapsed to one shared
 * terracotta so every accent moment across the site reads as the same
 * highlight. Kept as a per-pillar Record (all four entries identical) so
 * every consumer that already reads PILLAR_COLOR[p.id] picks this up with
 * no call-site changes. Deliberately not reused in the dashboard, where
 * mustard/teal/brick/pink still carry their own fixed meaning as the
 * PASS/FLAGGED/FAILING/INFO status system.
 */
const TERRACOTTA_ACCENT = {
  chip: "bg-terracotta",
  text: "text-terracotta-deep",
  border: "border-terracotta-deep",
  bar: "bg-terracotta-deep",
  hoverText: "group-hover:text-terracotta-deep",
  hoverPlain: "hover:text-terracotta-deep",
};

export const PILLAR_COLOR: Record<
  PillarId,
  { chip: string; text: string; border: string; bar: string; hoverText: string; hoverPlain: string }
> = {
  0: TERRACOTTA_ACCENT,
  1: TERRACOTTA_ACCENT,
  2: TERRACOTTA_ACCENT,
  3: TERRACOTTA_ACCENT,
};

export function PillarIcon({ pillar, size = 26 }: { pillar: PillarId; size?: number }) {
  // Ink stroke always — this icon sits on chips of all four accent colors,
  // and ink is the one tone that reads clearly against each of them.
  const stroke = "#171717";
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" aria-hidden="true">
      {pillar === 0 && (
        <>
          <path d="M13 22 L13 12" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path
            d="M13 12 C13 6 8 6 6 9 C9 12 13 12 13 12 Z"
            fill="none"
            stroke={stroke}
            strokeWidth="1.6"
          />
          <path
            d="M13 15 C13 10 18 10 20 13 C17 16 13 15 13 15 Z"
            fill="none"
            stroke={stroke}
            strokeWidth="1.6"
          />
        </>
      )}
      {pillar === 1 && (
        <>
          <path d="M6 20 L20 6" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path
            d="M9 6 L20 6 L20 17"
            fill="none"
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {pillar === 2 && (
        <>
          <circle cx="7" cy="18" r="1.8" fill={stroke} />
          <circle cx="13" cy="13" r="1.8" fill={stroke} />
          <circle cx="20" cy="7" r="1.8" fill={stroke} />
          <path
            d="M7 18 L13 13 L20 7"
            fill="none"
            stroke={stroke}
            strokeWidth="1"
            strokeDasharray="1 3"
          />
        </>
      )}
      {pillar === 3 && (
        <>
          <circle cx="11" cy="11" r="6.5" fill="none" stroke={stroke} strokeWidth="2" />
          <line
            x1="15.5"
            y1="15.5"
            x2="21"
            y2="21"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}
