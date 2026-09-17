import { formatStatus } from "../format";
import { B, MONO, SANS } from "../theme";
import type { DailyStatusMember, DailyStatusOffice } from "../types";
import { displayName, statusColor } from "../utils/statusSummary";
import { Avatar } from "./Avatar";
import { OfficePicker } from "./OfficePicker";

type PeoplePanelProps = {
  error: string | null;
  isEmptyReport: boolean;
  isEmptySearch: boolean;
  loading: boolean;
  members: DailyStatusMember[];
  office: string;
  offices: DailyStatusOffice[];
  onOfficeChange: (officeId: string) => void;
  onQueryChange: (query: string) => void;
  onSelectUser: (employeeId: string) => void;
  query: string;
  selectedUserId?: string;
};

const SHIMMER_ROWS = [0, 1, 2, 3, 4, 5];

function StateCard({ title, detail, tone }: { title: string; detail: string; tone: "neutral" | "error" }) {
  const isError = tone === "error";
  return (
    <div
      style={{
        margin: "12px",
        padding: "22px 16px",
        display: "grid",
        gap: 6,
        justifyItems: "center",
        textAlign: "center",
        borderRadius: 12,
        border: `1px dashed ${isError ? "rgba(251,113,133,.28)" : B.lineStr}`,
        background: isError ? "rgba(251,113,133,.06)" : "transparent",
      }}
    >
      <strong style={{ fontSize: 13, fontWeight: 600, color: B.text }}>{title}</strong>
      <span style={{ fontSize: 12, color: B.muted }}>{detail}</span>
    </div>
  );
}

export function PeoplePanel({
  error,
  isEmptyReport,
  isEmptySearch,
  loading,
  members,
  office,
  offices,
  onOfficeChange,
  onQueryChange,
  onSelectUser,
  query,
  selectedUserId,
}: PeoplePanelProps) {
  return (
    <div
      style={{
        width: 310,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: B.surface,
        borderRight: `1px solid ${B.line}`,
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 14px 12px",
          borderBottom: `1px solid ${B.line}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em", color: B.soft }}>Daily status</span>
        <OfficePicker offices={offices} value={office} onChange={onOfficeChange} />
      </div>

      <div style={{ padding: "10px 12px", borderBottom: `1px solid ${B.line}` }}>
        <div style={{ position: "relative" }}>
          <svg
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            width={13}
            height={13}
            viewBox="0 0 14 14"
            fill="none"
          >
            <circle cx={6} cy={6} r={4.5} stroke={B.muted} strokeWidth={1.4} />
            <path d="M9.5 9.5l2.5 2.5" stroke={B.muted} strokeWidth={1.4} strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search users…"
            style={{
              width: "100%",
              height: 36,
              borderRadius: 8,
              background: B.charcoal,
              border: `1px solid ${B.faint}`,
              color: B.text,
              fontSize: 13,
              paddingLeft: 30,
              paddingRight: 10,
              outline: "none",
              fontFamily: SANS,
              transition: "border-color .15s, box-shadow .15s",
            }}
            onFocus={(event) => {
              event.currentTarget.style.borderColor = B.orange;
              event.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,185,2,.15)";
            }}
            onBlur={(event) => {
              event.currentTarget.style.borderColor = B.faint;
              event.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      <div className="scrollable" style={{ flex: 1, overflowY: "auto" }}>
        {error ? (
          <StateCard title="Could not load users" detail={error} tone="error" />
        ) : loading ? (
          SHIMMER_ROWS.map((row) => (
            <div key={row} className="shimmer" style={{ height: 56, borderRadius: 8, margin: "8px 12px" }} />
          ))
        ) : isEmptyReport ? (
          <StateCard title="No employees" detail="No members were mapped for this date." tone="neutral" />
        ) : isEmptySearch ? (
          <StateCard title="No users found" detail="Try another search." tone="neutral" />
        ) : (
          members.map((member) => {
            const selected = member.employeeId === selectedUserId;
            const color = statusColor(member.status);
            return (
              <button
                key={member.employeeId}
                type="button"
                onClick={() => onSelectUser(member.employeeId)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "10px 14px",
                  textAlign: "left",
                  background: selected ? "rgba(255,185,2,.07)" : "transparent",
                  borderLeft: `2px solid ${selected ? B.orange : "transparent"}`,
                  borderRight: "none",
                  borderTop: "none",
                  borderBottom: `1px solid ${B.line}`,
                  cursor: "pointer",
                  transition: "background .12s",
                }}
                onMouseEnter={(event) => {
                  if (!selected) event.currentTarget.style.background = "rgba(255,255,255,.03)";
                }}
                onMouseLeave={(event) => {
                  if (!selected) event.currentTarget.style.background = "transparent";
                }}
              >
                <Avatar name={displayName(member)} size={34} src={member.imgUrl} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: selected ? B.text : B.soft,
                      letterSpacing: "-0.01em",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {displayName(member)}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 1, display: "flex", alignItems: "center", gap: 5 }}>
                    {member.localCheckInTime && (
                      <>
                        <span style={{ fontFamily: MONO, fontSize: 11, color: B.muted }}>
                          {member.localCheckInTime}
                        </span>
                        <span style={{ color: B.faint }}>·</span>
                      </>
                    )}
                    <span style={{ color }}>{formatStatus(member.status)}</span>
                  </div>
                </div>
                <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: color }} />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
