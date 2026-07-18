export type PillarId = 0 | 1 | 2 | 3;

export function PillarIcon({ pillar, size = 26 }: { pillar: PillarId; size?: number }) {
  const stroke = "#332A22";
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
