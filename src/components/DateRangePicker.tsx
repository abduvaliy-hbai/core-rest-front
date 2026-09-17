import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { todayKey } from "../format";
import { B, SANS } from "../theme";
import {
  addMonths,
  calendarDays,
  clampDateKey,
  clampRangeToToday,
  compactRangeLabel,
  cycleRange,
  longRangeLabel,
  monthRange,
  monthStart,
  monthTitle,
  parseDate,
  quarterRange,
} from "../utils/dateRange";

type DateRange = { fromDate: string; toDate: string };

type DateRangePickerProps = DateRange & {
  onChange: (range: DateRange) => void;
};

type IconName = keyof typeof ICON_PATHS;

const TINT = "rgba(255,185,2,.12)";
const HOVER = "rgba(255,255,255,.05)";

// Single-stroke line icons on a 24px grid, inheriting `currentColor` so each call site tints them.
const ICON_PATHS = {
  calendar: (
    <>
      <rect height="16" rx="2.5" width="17" x="3.5" y="4.5" />
      <path d="M3.5 9.5h17M8 2.5v4M16 2.5v4" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  grid: (
    <>
      <rect height="16" rx="2.5" width="17" x="3.5" y="4.5" />
      <path d="M3.5 9.5h17M12 9.5V21M3.5 15h17" />
    </>
  ),
  check: (
    <>
      <rect height="16" rx="2.5" width="17" x="3.5" y="4.5" />
      <path d="M3.5 9.5h17M8 2.5v4M16 2.5v4M9 15l2.2 2.2L15.5 13" />
    </>
  ),
  undo: (
    <>
      <path d="M3.5 8.5h6v-6" />
      <path d="M4.6 15a8 8 0 1 0 1.7-8.3L3.5 9.2" />
    </>
  ),
  redo: (
    <>
      <path d="M20.5 8.5h-6v-6" />
      <path d="M19.4 15A8 8 0 1 1 17.7 6.7l2.8 2.5" />
    </>
  ),
  chevronLeft: <path d="M14.5 5.5 8 12l6.5 6.5" />,
  chevronRight: <path d="M9.5 5.5 16 12l-6.5 6.5" />,
} satisfies Record<string, ReactNode>;

function Icon({ name, size = 14 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
      width={size}
      style={{ flex: "0 0 auto" }}
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

const chevronStyle: CSSProperties = {
  width: 26,
  height: 26,
  display: "grid",
  placeItems: "center",
  border: 0,
  borderRadius: 7,
  background: "transparent",
  color: B.soft,
  cursor: "pointer",
  padding: 0,
};

const actionStyle: CSSProperties = {
  height: 32,
  borderRadius: 8,
  cursor: "pointer",
  fontFamily: SANS,
  fontSize: 12,
  fontWeight: 600,
};

export function DateRangePicker({ fromDate, toDate, onChange }: DateRangePickerProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [draftFromDate, setDraftFromDate] = useState(fromDate);
  const [draftToDate, setDraftToDate] = useState(toDate);
  const [pickerMonth, setPickerMonth] = useState(monthStart(toDate));
  const [selectingRangeStart, setSelectingRangeStart] = useState(true);
  const [activePreset, setActivePreset] = useState<string | null>("this-cycle");

  // Escape discards the draft rather than applying it, matching Cancel — only Confirm commits.
  useEffect(() => {
    if (!datePickerOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDatePickerOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [datePickerOpen]);

  const calendarCells = useMemo(() => calendarDays(pickerMonth), [pickerMonth]);
  const presets = useMemo(() => {
    const today = todayKey();
    return [
      { key: "today", icon: "calendar" as const, label: "Today", range: { fromDate: today, toDate: today } },
      { key: "this-cycle", icon: "target" as const, label: "This Cycle", range: cycleRange(today, 0) },
      { key: "last-cycle", icon: "undo" as const, label: "Last Cycle", range: cycleRange(today, -1) },
      { key: "this-month", icon: "check" as const, label: "This Month", range: monthRange(today, 0) },
      { key: "last-month", icon: "clock" as const, label: "Last Month", range: monthRange(today, -1) },
      { key: "this-quarter", icon: "grid" as const, label: "This Quarter", range: quarterRange(today, 0) },
      { key: "last-quarter", icon: "redo" as const, label: "Last Quarter", range: quarterRange(today, -1) },
    ];
  }, []);

  // Reopening the picker re-lights whichever preset the applied range came from. A range that matches
  // no preset falls back to This Cycle, which is always the resting highlight.
  const presetKeyFor = (range: DateRange) => {
    const normalized = clampRangeToToday(range);
    return (
      presets.find((preset) => {
        const candidate = clampRangeToToday(preset.range);
        return candidate.fromDate === normalized.fromDate && candidate.toDate === normalized.toDate;
      })?.key ?? "this-cycle"
    );
  };

  const openDatePicker = () => {
    setDraftFromDate(fromDate);
    setDraftToDate(toDate);
    setPickerMonth(monthStart(toDate));
    setSelectingRangeStart(true);
    setActivePreset(presetKeyFor({ fromDate, toDate }));
    setDatePickerOpen(true);
  };

  const applyPreset = (preset: { key: string; range: DateRange }) => {
    const normalized = clampRangeToToday(preset.range);
    setDraftFromDate(normalized.fromDate);
    setDraftToDate(normalized.toDate);
    setPickerMonth(monthStart(normalized.toDate));
    setSelectingRangeStart(false);
    setActivePreset(preset.key);
  };

  const pickCalendarDate = (dateKey: string) => {
    setActivePreset(null);
    if (selectingRangeStart || parseDate(dateKey).getTime() < parseDate(draftFromDate).getTime()) {
      setDraftFromDate(dateKey);
      setDraftToDate(dateKey);
      setSelectingRangeStart(false);
      return;
    }
    setDraftToDate(clampDateKey(dateKey, todayKey()));
    setSelectingRangeStart(true);
  };

  const confirmDateRange = () => {
    onChange(clampRangeToToday({ fromDate: draftFromDate, toDate: draftToDate }));
    setDatePickerOpen(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        aria-expanded={datePickerOpen}
        onClick={openDatePicker}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: B.charcoal,
          border: `1px solid ${datePickerOpen ? B.orange : B.faint}`,
          borderRadius: 8,
          padding: "7px 13px",
          cursor: "pointer",
          color: B.soft,
          fontSize: 12,
          fontFamily: SANS,
          whiteSpace: "nowrap",
          transition: "border-color .15s",
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.borderColor = B.orange;
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.borderColor = datePickerOpen ? B.orange : B.faint;
        }}
        type="button"
      >
        <svg width={13} height={13} viewBox="0 0 14 14" fill="none">
          <rect x={1} y={2.5} width={12} height={10} rx={1.5} stroke="currentColor" strokeWidth={1.2} />
          <path d="M4 1v3M10 1v3M1 6h12" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
        </svg>
        {longRangeLabel(fromDate, toDate)}
      </button>

      {datePickerOpen ? (
        <>
          {/* Catcher sits behind the panel and above the page; mousedown closes before the click lands. */}
          <div
            onMouseDown={() => setDatePickerOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 39 }}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              zIndex: 40,
              display: "flex",
              background: B.charcoal,
              border: `1px solid ${B.faint}`,
              borderRadius: 10,
              boxShadow: "0 20px 48px rgba(0,0,0,.65)",
              overflow: "hidden",
              fontFamily: SANS,
            }}
          >
            <section style={{ display: "flex", flexDirection: "column", padding: "14px 16px 16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "26px 1fr 26px", alignItems: "center", gap: 8 }}>
                <button
                  aria-label="Previous month"
                  onClick={() => setPickerMonth(addMonths(pickerMonth, -1))}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = HOVER;
                    event.currentTarget.style.color = B.text;
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = "transparent";
                    event.currentTarget.style.color = B.soft;
                  }}
                  style={chevronStyle}
                  type="button"
                >
                  <Icon name="chevronLeft" size={16} />
                </button>
                <strong
                  style={{
                    textAlign: "center",
                    color: B.text,
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {monthTitle(pickerMonth)}
                </strong>
                <button
                  aria-label="Next month"
                  onClick={() => setPickerMonth(addMonths(pickerMonth, 1))}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = HOVER;
                    event.currentTarget.style.color = B.text;
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = "transparent";
                    event.currentTarget.style.color = B.soft;
                  }}
                  style={chevronStyle}
                  type="button"
                >
                  <Icon name="chevronRight" size={16} />
                </button>
              </div>

              <div
                style={{
                  width: "max-content",
                  margin: "10px auto 0",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 11px",
                  borderRadius: 999,
                  background: TINT,
                  color: B.orange,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                <Icon name="calendar" size={12} />
                {selectingRangeStart ? "Select start date" : "Select end date"}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 32px)",
                  gap: 4,
                  margin: "14px 0 6px",
                  color: B.muted,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textAlign: "center",
                }}
              >
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 32px)", gap: 4 }}>
                {calendarCells.map((dateKey, index) => {
                  if (!dateKey) return <span key={`empty-${index}`} style={{ height: 30 }} />;
                  const time = parseDate(dateKey).getTime();
                  const afterToday = time > parseDate(todayKey()).getTime();
                  const inRange =
                    time >= parseDate(draftFromDate).getTime() && time <= parseDate(draftToDate).getTime();
                  const edge = dateKey === draftFromDate || dateKey === draftToDate;
                  const background = edge ? B.orange : inRange ? TINT : "transparent";
                  const color = afterToday ? B.faint : edge ? B.black : inRange ? B.text : B.soft;
                  return (
                    <button
                      disabled={afterToday}
                      key={dateKey}
                      onClick={() => pickCalendarDate(dateKey)}
                      onMouseEnter={(event) => {
                        if (!edge) event.currentTarget.style.background = HOVER;
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background = background;
                      }}
                      style={{
                        height: 30,
                        border: 0,
                        borderRadius: 7,
                        padding: 0,
                        background,
                        color,
                        cursor: afterToday ? "default" : "pointer",
                        pointerEvents: afterToday ? "none" : "auto",
                        fontFamily: SANS,
                        fontSize: 12,
                        fontWeight: edge ? 700 : 500,
                        transition: "background .12s, color .12s",
                      }}
                      type="button"
                    >
                      {parseDate(dateKey).getDate()}
                    </button>
                  );
                })}
              </div>
            </section>

            <aside
              style={{
                width: 168,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                padding: "14px 12px 16px",
                borderLeft: `1px solid ${B.line}`,
              }}
            >
              <strong
                style={{
                  margin: "0 0 6px 2px",
                  color: B.muted,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Quick Select
              </strong>
              {presets.map((preset) => {
                const active = activePreset === preset.key;
                return (
                  <button
                    key={preset.key}
                    onClick={() => applyPreset(preset)}
                    onMouseEnter={(event) => {
                      if (!active) {
                        event.currentTarget.style.background = HOVER;
                        event.currentTarget.style.color = B.text;
                      }
                    }}
                    onMouseLeave={(event) => {
                      if (!active) {
                        event.currentTarget.style.background = "transparent";
                        event.currentTarget.style.color = B.soft;
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      height: 30,
                      padding: "0 9px",
                      border: 0,
                      borderRadius: 7,
                      background: active ? TINT : "transparent",
                      color: active ? B.orange : B.soft,
                      cursor: "pointer",
                      fontFamily: SANS,
                      fontSize: 12,
                      fontWeight: active ? 600 : 500,
                      textAlign: "left",
                      transition: "background .12s, color .12s",
                    }}
                    title={compactRangeLabel(preset.range)}
                    type="button"
                  >
                    <Icon name={preset.icon} />
                    {preset.label}
                  </button>
                );
              })}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: "auto", paddingTop: 14 }}>
                <button
                  onClick={() => setDatePickerOpen(false)}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = HOVER;
                    event.currentTarget.style.color = B.text;
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = "transparent";
                    event.currentTarget.style.color = B.soft;
                  }}
                  style={{ ...actionStyle, border: `1px solid ${B.faint}`, background: "transparent", color: B.soft }}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDateRange}
                  style={{ ...actionStyle, border: 0, background: B.orange, color: B.black, fontWeight: 700 }}
                  type="button"
                >
                  Confirm
                </button>
              </div>
            </aside>
          </div>
        </>
      ) : null}
    </div>
  );
}
