import type { VanWestendorpResult } from "@/lib/pricing/van-westendorp";

const CURVE_STYLE: { key: keyof VanWestendorpResult["curves"]; label: string; color: string }[] = [
  { key: "tooCheap", label: "Too cheap", color: "#396460" },
  { key: "bargain", label: "Bargain", color: "#4e8580" },
  { key: "expensive", label: "Getting expensive", color: "#b8842b" },
  { key: "tooExpensive", label: "Too expensive", color: "#bd5a3f" },
];

const POINT_STYLE: { key: keyof VanWestendorpResult["points"]; label: string }[] = [
  { key: "pmc", label: "Point of Marginal Cheapness" },
  { key: "opp", label: "Optimal Price Point" },
  { key: "ipp", label: "Indifference Price Point" },
  { key: "pme", label: "Point of Marginal Expensiveness" },
];

const W = 640;
const H = 320;
const PAD = { top: 16, right: 16, bottom: 36, left: 40 };

function fmtPrice(n: number) {
  return `$${n.toFixed(2).replace(/\.00$/, "")}`;
}

export function VanWestendorpChart({ result, currency = "$" }: { result: VanWestendorpResult; currency?: string }) {
  const allPrices = Object.values(result.curves).flatMap((c) => c.map((p) => p.price));
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (price: number) => PAD.left + ((price - minPrice) / priceRange) * innerW;
  const y = (pct: number) => PAD.top + innerH - (pct / 100) * innerH;

  const yTicks = [0, 25, 50, 75, 100];
  const xTicks = [minPrice, minPrice + priceRange * 0.25, minPrice + priceRange * 0.5, minPrice + priceRange * 0.75, maxPrice];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Van Westendorp price sensitivity chart">
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#171717" strokeOpacity={0.12} strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontFamily="var(--font-mono)" fontSize={9} fill="#5C4F41">
              {t}%
            </text>
          </g>
        ))}
        {xTicks.map((t, i) => (
          <text key={i} x={x(t)} y={H - PAD.bottom + 16} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={9} fill="#5C4F41">
            {currency}
            {Math.round(t)}
          </text>
        ))}
        <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={H - PAD.bottom} stroke="#171717" strokeWidth={1.5} />
        <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom} stroke="#171717" strokeWidth={1.5} />

        {CURVE_STYLE.map(({ key, color }) => {
          const pts = result.curves[key];
          const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.price)} ${y(p.pct)}`).join(" ");
          return <path key={key} d={d} fill="none" stroke={color} strokeWidth={2} />;
        })}

        {POINT_STYLE.map(({ key }) => {
          const price = result.points[key];
          if (price === null) return null;
          return (
            <line
              key={key}
              x1={x(price)}
              x2={x(price)}
              y1={PAD.top}
              y2={H - PAD.bottom}
              stroke="#171717"
              strokeWidth={1}
              strokeDasharray="2 3"
              strokeOpacity={0.5}
            />
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap gap-4">
        {CURVE_STYLE.map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-1.5 font-mono text-[10.5px] text-ink-soft">
            <span className="h-2 w-4" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {POINT_STYLE.map(({ key, label }) => {
          const price = result.points[key];
          return (
            <div key={key} className="border-2 border-ink bg-paper p-3">
              <div className="font-mono text-[9px] uppercase tracking-wide text-ink-soft">{label}</div>
              <div className="mt-1 font-display text-[17px] font-semibold text-ink">{price !== null ? fmtPrice(price) : "—"}</div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[11.5px] text-ink-soft">
        Acceptable range runs roughly from Point of Marginal Cheapness to Point of Marginal
        Expensiveness — {result.n} price response{result.n === 1 ? "" : "s"}
        {result.consistentCount < result.n && `, ${result.n - result.consistentCount} with an out-of-order answer (too cheap ≤ bargain ≤ expensive ≤ too expensive) — included, but treat with caution`}.
      </p>
    </div>
  );
}
