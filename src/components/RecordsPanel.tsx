import { formatLocalTime } from "../format";
import { B, MONO } from "../theme";
import type { DailyStatusMember, DailyStatusUserDay } from "../types";
import { dayLabel } from "../utils/dateRange";
import { displayName, recordCaption, statusColor } from "../utils/statusSummary";
import { EmptyState, ShimmerRows } from "./States";

type RecordsPanelProps = {
  days: DailyStatusUserDay[];
  error: string | null;
  loading: boolean;
  selectedMember: DailyStatusMember | null;
};

export function RecordsPanel({ days, error, loading, selectedMember }: RecordsPanelProps) {
  // The API returns days oldest-first; the scroll reads best with the newest day on top.
  const records = [...days].reverse();

  return (
    <div
      style={{
        width: 330,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: `1px solid ${B.line}`,
        background: B.surfaceMid,
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${B.line}` }}>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", color: B.text }}>Status records</div>
        <div style={{ fontSize: 12, color: B.muted, marginTop: 2 }}>{displayName(selectedMember)}</div>
      </div>

      <div
        className="scrollable"
        style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 4 }}
      >
        {error ? (
          <EmptyState tone="error" title="Could not load records" detail={error} />
        ) : loading ? (
          <ShimmerRows count={8} height={58} />
        ) : !selectedMember ? (
          <EmptyState title="No one selected" detail="Pick a person from the roster." />
        ) : records.length === 0 ? (
          <EmptyState title="No status records" detail="No check-in history inside this range." />
        ) : (
          records.map((record) => {
            const color = statusColor(record.status);
            return (
              <div
                key={record.date}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: B.charcoal,
                  border: `1px solid ${B.line}`,
                  borderLeft: `3px solid ${color}`,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: B.soft }}>{dayLabel(record.date)}</div>
                  <div style={{ fontSize: 11, color: B.muted, marginTop: 2 }}>{recordCaption(record.status)}</div>
                </div>
                {record.localCheckInTime ? (
                  <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 500, color }}>
                    {formatLocalTime(record.localCheckInTime)}
                  </span>
                ) : (
                  <span style={{ fontSize: 18, color: B.faint, fontWeight: 400, lineHeight: 1 }}>—</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
