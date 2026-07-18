export function TrendChart({
  points,
  target,
  caption,
  yFormat = (v) => v.toFixed(1),
}: {
  points: number[];
  target?: number;
  caption: string;
  yFormat?: (v: number) => string;
}) {
  const w = 480;
  const h = 180;
  const padL = 40;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const max = Math.max(...points, target ?? 0) * 1.15 || 1;
  const min = 0;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const x = (i: number) => padL + (i / (points.length - 1 || 1)) * innerW;
  const y = (v: number) => padT + innerH - ((v - min) / (max - min)) * innerH;

  const linePoints = points.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const gridLines = [0.25, 0.5, 0.75].map((f) => padT + innerH * f);

  return (
    <div className="border-2 border-ink bg-paper p-5">
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
        <g stroke="#332A22" strokeOpacity="0.12" strokeWidth="1">
          <line x1={padL} y1={padT} x2={padL} y2={h - padB} />
          <line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} />
          {gridLines.map((gy) => (
            <line key={gy} x1={padL} y1={gy} x2={w - padR} y2={gy} />
          ))}
        </g>
        {target !== undefined && (
          <>
            <line
              x1={padL}
              y1={y(target)}
              x2={w - padR}
              y2={y(target)}
              stroke="#332A22"
              strokeWidth="1"
              strokeDasharray="3 4"
              opacity="0.5"
            />
            <text x={w - padR + 3} y={y(target) + 3} fontFamily="var(--font-mono)" fontSize="8" fill="#5C4F41">
              target
            </text>
          </>
        )}
        <polyline
          points={linePoints}
          fill="none"
          stroke="#4E8580"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <g fill="#4E8580" stroke="#FBF6EA" strokeWidth="1.5">
          {points.map((v, i) => (
            <circle key={i} cx={x(i)} cy={y(v)} r="3.5" />
          ))}
        </g>
        {gridLines.concat([h - padB]).map((gy, i) => (
          <text key={i} x={8} y={gy + 3} fontFamily="var(--font-mono)" fontSize="8" fill="#5C4F41">
            {yFormat(min + (max - min) * (1 - (gy - padT) / innerH))}
          </text>
        ))}
      </svg>
      <div className="mt-2.5 text-center font-mono text-[10px] text-ink-soft uppercase">{caption}</div>
    </div>
  );
}
