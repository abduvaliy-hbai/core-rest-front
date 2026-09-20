import { B } from "../theme";

export function ShimmerRows({ count = 6, height = 56 }: { count?: number; height?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Array.from({ length: count }, (_, row) => (
        <div key={row} className="shimmer" style={{ height, borderRadius: 0 }} />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  detail,
  tone = "neutral",
}: {
  title: string;
  detail: string;
  tone?: "neutral" | "error";
}) {
  const isError = tone === "error";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        textAlign: "center",
        minHeight: 120,
        padding: 18,
        borderRadius: 0,
        border: `1px dashed ${isError ? "rgba(251,113,133,.28)" : B.lineStr}`,
        background: isError ? "rgba(251,113,133,.06)" : "transparent",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: B.text }}>{title}</div>
      <div style={{ fontSize: 12, color: B.muted }}>{detail}</div>
    </div>
  );
}
