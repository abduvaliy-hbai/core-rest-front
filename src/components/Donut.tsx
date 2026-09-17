import { B, MONO, SANS } from "../theme";

const SIZE = 300;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 124;
const RI = R * 0.58;

const LEGEND: Array<{ color: string; label: string }> = [
  { color: B.green, label: "On time" },
  { color: B.amber, label: "Late" },
  { color: B.red, label: "Missed" },
];

function Ring({ color }: { color: string }) {
  return <circle cx={CX} cy={CY} r={(R + RI) / 2} fill="none" stroke={color} strokeWidth={R - RI} />;
}

function arc(start: number, end: number, color: string) {
  const span = end - start;
  if (span < 0.001) return null;
  // A single elliptical-arc command cannot draw a full turn: at 100% the start and end
  // points coincide and the browser collapses the path, blanking a perfect record.
  if (span > 0.999) return <Ring color={color} />;

  const a1 = start * 2 * Math.PI - Math.PI / 2;
  const a2 = end * 2 * Math.PI - Math.PI / 2;
  const large = span > 0.5 ? 1 : 0;
  const x1 = CX + R * Math.cos(a1);
  const y1 = CY + R * Math.sin(a1);
  const x2 = CX + R * Math.cos(a2);
  const y2 = CY + R * Math.sin(a2);
  const ix1 = CX + RI * Math.cos(a1);
  const iy1 = CY + RI * Math.sin(a1);
  const ix2 = CX + RI * Math.cos(a2);
  const iy2 = CY + RI * Math.sin(a2);
  return (
    <path
      d={`M${x1} ${y1}A${R} ${R} 0 ${large} 1 ${x2} ${y2}L${ix2} ${iy2}A${RI} ${RI} 0 ${large} 0 ${ix1} ${iy1}Z`}
      fill={color}
    />
  );
}

export function Donut({ onTime, late, missed }: { onTime: number; late: number; missed: number }) {
  const total = onTime + late + missed;
  const percent = total === 0 ? 0 : Math.round((onTime / total) * 100);
  const onTimeFraction = total === 0 ? 0 : onTime / total;
  const lateFraction = total === 0 ? 0 : onTimeFraction + late / total;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {total === 0 ? (
          <Ring color={B.faint} />
        ) : (
          <>
            {arc(0, onTimeFraction, B.green)}
            {arc(onTimeFraction, lateFraction, B.amber)}
            {arc(lateFraction, 1, B.red)}
          </>
        )}
        <circle cx={CX} cy={CY} r={RI - 1} fill={B.surfaceLow} />
        <text
          x={CX}
          y={CY - 5}
          textAnchor="middle"
          fill={B.text}
          fontFamily={MONO}
          fontWeight={600}
          fontSize={28}
        >
          {percent}%
        </text>
        <text x={CX} y={CY + 16} textAnchor="middle" fill={B.muted} fontFamily={SANS} fontSize={12}>
          on time
        </text>
      </svg>
      <div style={{ display: "flex", gap: 18 }}>
        {LEGEND.map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: item.color }} />
            <span style={{ fontSize: 12, color: B.muted }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
