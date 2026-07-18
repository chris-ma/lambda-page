import type { Status } from "@/lib/status";

const STROKES: Record<Status, string> = {
  PASS: "#396460",
  FLAGGED: "#B8842B",
  FAILING: "#BD5A3F",
  INFO: "#C97A70",
};

export function StatusIcon({ status, size = 20 }: { status: Status; size?: number }) {
  const stroke = STROKES[status];
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" aria-hidden="true">
      {status === "PASS" && (
        <path
          d="M5 13 L11 19 L21 6"
          fill="none"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {status === "FLAGGED" && (
        <>
          <path d="M13 4 L13 15" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="13" cy="20" r="1.6" fill={stroke} />
        </>
      )}
      {status === "FAILING" && (
        <path
          d="M6 6 L20 20 M20 6 L6 20"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}
      {status === "INFO" && (
        <>
          <path d="M13 11 L13 20" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="13" cy="6.5" r="1.6" fill={stroke} />
        </>
      )}
    </svg>
  );
}
