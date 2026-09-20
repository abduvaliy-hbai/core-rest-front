import { useBreakpoint } from "../hooks/useBreakpoint";
import { B, MONO } from "../theme";
import type { DailyStatusMember } from "../types";
import { rangeLabel } from "../utils/dateRange";
import { displayName, type StatusSummary } from "../utils/statusSummary";
import { Donut } from "./Donut";
import { EmptyState, ShimmerRows } from "./States";

type AnalyticsPanelProps = {
  error: string | null;
  fromDate: string;
  loading: boolean;
  rangeDays: number;
  selectedMember: DailyStatusMember | null;
  summary: StatusSummary;
  toDate: string;
};

export function AnalyticsPanel({
  error,
  fromDate,
  loading,
  rangeDays,
  selectedMember,
  summary,
  toDate,
}: AnalyticsPanelProps) {
  const isPhone = useBreakpoint() === "phone";
  const cards = [
    { label: "Tracked days", value: summary.total, sub: "inside selected range", color: B.text },
    { label: "On-time streak", value: summary.onTimeStreak, sub: "consecutive days", color: B.green },
    { label: "Late streak", value: summary.lateStreak, sub: "consecutive days", color: B.amber },
  ];

  return (
    <div
      style={{
        // Inside the locked phone shell the summary keeps its natural height but
        // may shrink, and scrolls internally rather than growing the page.
        flex: isPhone ? "0 1 auto" : 1,
        minWidth: isPhone ? 0 : 360,
        display: "flex",
        flexDirection: "column",
        background: B.surfaceLow,
        minHeight: 0,
        height: isPhone ? "auto" : "100%",
        overflow: "hidden",
      }}
    >
      <div
        className="scrollable"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: isPhone ? "18px 16px 24px" : "22px 28px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: B.orange,
            marginBottom: 10,
          }}
        >
          Punctuality Overview
        </div>

        <h1
          style={{
            fontSize: isPhone ? 26 : "clamp(26px, 2.8vw, 42px)",
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.025em",
            color: B.text,
            margin: "0 0 10px",
          }}
        >
          {displayName(selectedMember)}
        </h1>

        {/* The counts are zero until the range resolves, so the sentence waits for real data. */}
        {!error && !loading && (
          <p style={{ fontSize: 13, color: B.muted, margin: "0 0 24px", lineHeight: 1.6 }}>
            {`${rangeLabel(fromDate, toDate)} · ${rangeDays} days: ${summary.onTime} on-time, ${summary.late} late, ${summary.missed} missed.`}
          </p>
        )}

        {error ? (
          <EmptyState tone="error" title="Could not load analytics" detail={error} />
        ) : loading ? (
          <ShimmerRows count={3} height={72} />
        ) : (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: isPhone ? 22 : 30 }}>
              {cards.map((card) => (
                <div
                  key={card.label}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    borderRadius: 0,
                    padding: isPhone ? "10px 10px" : "13px 15px",
                    background: B.charcoal,
                    border: `1px solid ${B.line}`,
                  }}
                >
                  <div style={{ fontSize: 11, color: B.muted, marginBottom: 7 }}>{card.label}</div>
                  <div
                    style={{
                      fontSize: isPhone ? 22 : 26,
                      fontWeight: 600,
                      fontFamily: MONO,
                      color: card.color,
                      lineHeight: 1,
                    }}
                  >
                    {card.value}
                  </div>
                  <div style={{ fontSize: 11, color: B.faint, marginTop: 5 }}>{card.sub}</div>
                </div>
              ))}
            </div>

            <Donut
              onTime={summary.onTime}
              late={summary.late}
              missed={summary.missed}
              size={isPhone ? 240 : 300}
            />
          </>
        )}
      </div>
    </div>
  );
}
