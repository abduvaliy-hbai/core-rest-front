import { B, SANS } from "../theme";

export function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <polygon points="14,2 25,8 25,20 14,26 3,20 3,8" fill={B.orange} />
        <polygon points="14,6 21.5,10.5 21.5,19.5 14,24 6.5,19.5 6.5,10.5" fill={B.yellow} />
        <text
          x="14"
          y="18"
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          fontFamily={SANS}
          fill={B.black}
          letterSpacing="0"
        >
          HB
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: B.text, letterSpacing: "-0.01em", lineHeight: 1 }}>
          humblebee
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: B.muted,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          attendance
        </span>
      </div>
    </div>
  );
}
