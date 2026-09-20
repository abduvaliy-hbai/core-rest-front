import { DateRangePicker } from "./DateRangePicker";
import { Logo } from "./Logo";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { B, MONO } from "../theme";
import { shortDate } from "../utils/dateRange";

type TopbarProps = {
  counts: { onTime: number; late: number; missed: number };
  employeeCount: number;
  fromDate: string;
  loading: boolean;
  onRangeChange: (range: { fromDate: string; toDate: string }) => void;
  toDate: string;
};

export function Topbar({ counts, employeeCount, fromDate, loading, onRangeChange, toDate }: TopbarProps) {
  // An in-flight first fetch has zeros everywhere, which would otherwise read as a real all-absent roster.
  const pending = loading && employeeCount === 0;
  const isPhone = useBreakpoint() === "phone";

  const kpis = [
    { count: counts.onTime, color: B.green, label: "on time" },
    { count: counts.late, color: B.amber, label: "late" },
    { count: counts.missed, color: B.red, label: "missed" },
  ];

  const roster = pending ? "Loading daily status…" : `${employeeCount} employees · ${shortDate(toDate)}`;

  if (isPhone) {
    return (
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: "10px 14px 12px",
          borderBottom: `1px solid ${B.line}`,
          background: B.surface,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <Logo />
          <span style={{ fontSize: 11, color: B.muted, textAlign: "right" }}>{roster}</span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {kpis.map(({ count, color, label }) => (
            <div
              key={label}
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "baseline",
                justifyContent: "center",
                gap: 5,
                padding: "7px 4px",
                borderRadius: 0,
                background: B.charcoal,
                border: `1px solid ${B.line}`,
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, color }}>
                {pending ? "—" : count}
              </span>
              <span style={{ fontSize: 11, color: B.muted, whiteSpace: "nowrap" }}>{label}</span>
            </div>
          ))}
        </div>

        <DateRangePicker fromDate={fromDate} toDate={toDate} onChange={onRangeChange} />
      </div>
    );
  }

  return (
    <div
      style={{
        height: 56,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "0 20px",
        borderBottom: `1px solid ${B.line}`,
        background: B.surface,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20, minWidth: 0 }}>
        <Logo />

        <div style={{ width: 1, height: 20, background: B.line, flexShrink: 0 }} />

        <span style={{ fontSize: 12, color: B.muted, whiteSpace: "nowrap" }}>{roster}</span>

        <div style={{ display: "flex", gap: 14 }}>
          {kpis.map(({ count, color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color }}>
                {pending ? "—" : count}
              </span>
              <span style={{ fontSize: 12, color: B.muted }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <DateRangePicker fromDate={fromDate} toDate={toDate} onChange={onRangeChange} />
    </div>
  );
}
