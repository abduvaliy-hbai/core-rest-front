import { DateRangePicker } from "./DateRangePicker";
import { Logo } from "./Logo";
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

  const kpis = [
    { count: counts.onTime, color: B.green, label: "on time" },
    { count: counts.late, color: B.amber, label: "late" },
    { count: counts.missed, color: B.red, label: "missed" },
  ];

  return (
    <div
      style={{
        height: 56,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: `1px solid ${B.line}`,
        background: B.surface,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Logo />

        <div style={{ width: 1, height: 20, background: B.line }} />

        <span style={{ fontSize: 12, color: B.muted }}>
          {pending ? "Loading daily status…" : `${employeeCount} employees · ${shortDate(toDate)}`}
        </span>

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
