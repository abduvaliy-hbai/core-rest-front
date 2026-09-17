import { DATE_STORAGE_KEY, FROM_DATE_STORAGE_KEY, RANGE_OPTIONS, RANGE_STORAGE_KEY, TO_DATE_STORAGE_KEY, type RangeDays } from "../constants";
import { todayKey } from "../format";

export function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function dateKeyFromDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(dateKey: string, days: number) {
  const date = parseDate(dateKey);
  date.setDate(date.getDate() + days);
  return dateKeyFromDate(date);
}

export function addMonths(dateKey: string, months: number) {
  const date = parseDate(dateKey);
  date.setMonth(date.getMonth() + months, 1);
  return dateKeyFromDate(date);
}

export function monthStart(dateKey: string) {
  const date = parseDate(dateKey);
  return dateKeyFromDate(new Date(date.getFullYear(), date.getMonth(), 1, 12));
}

export function monthEnd(dateKey: string) {
  const date = parseDate(dateKey);
  return dateKeyFromDate(new Date(date.getFullYear(), date.getMonth() + 1, 0, 12));
}

export function startDateFor(endDate: string, rangeDays: RangeDays) {
  return addDays(endDate, -(rangeDays - 1));
}

export function parseRangeDays(value: string | null): RangeDays | null {
  const parsed = Number(value);
  return RANGE_OPTIONS.includes(parsed as RangeDays) ? parsed as RangeDays : null;
}

export function parseDateKey(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = parseDate(value);
  const isValid = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return isValid ? value : null;
}

export function dateRangeDays(fromDate: string, toDate: string) {
  const start = parseDate(fromDate).getTime();
  const end = parseDate(toDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 1;
  return Math.max(1, Math.round((end - start) / 86_400_000) + 1);
}

export function presetForRange(fromDate: string, toDate: string): RangeDays | null {
  const days = dateRangeDays(fromDate, toDate);
  return RANGE_OPTIONS.includes(days as RangeDays) && fromDate === startDateFor(toDate, days as RangeDays)
    ? days as RangeDays
    : null;
}

export function normalizeRange(fromDate: string, toDate: string) {
  return parseDate(fromDate).getTime() <= parseDate(toDate).getTime()
    ? { fromDate, toDate }
    : { fromDate: toDate, toDate: fromDate };
}

export function clampDateKey(value: string, maxDate: string) {
  return parseDate(value).getTime() > parseDate(maxDate).getTime() ? maxDate : value;
}

export function isBeforeDate(left: string, right: string) {
  return parseDate(left).getTime() < parseDate(right).getTime();
}

export function rollRangeToToday(fromDate: string, toDate: string) {
  const today = todayKey();
  if (!isBeforeDate(toDate, today)) return { fromDate, toDate };
  const days = dateRangeDays(fromDate, toDate);
  return { fromDate: addDays(today, -(days - 1)), toDate: today };
}

export function initialDateRange() {
  const today = todayKey();
  if (typeof window === "undefined") {
    return { fromDate: startDateFor(today, 14), toDate: today };
  }
  const params = new URLSearchParams(window.location.search);
  const rawToDate = parseDateKey(params.get("to"))
    ?? parseDateKey(params.get("date"))
    ?? parseDateKey(window.localStorage.getItem(TO_DATE_STORAGE_KEY))
    ?? parseDateKey(window.localStorage.getItem(DATE_STORAGE_KEY))
    ?? today;
  const toDate = clampDateKey(rawToDate, today);
  const rangeDays = parseRangeDays(params.get("range"))
    ?? parseRangeDays(window.localStorage.getItem(RANGE_STORAGE_KEY))
    ?? 14;
  const rawFromDate = parseDateKey(params.get("from"))
    ?? parseDateKey(window.localStorage.getItem(FROM_DATE_STORAGE_KEY))
    ?? startDateFor(toDate, rangeDays);
  const fromDate = clampDateKey(rawFromDate, today);

  const normalized = normalizeRange(fromDate, toDate);
  return rollRangeToToday(normalized.fromDate, normalized.toDate);
}

// The dashboard chrome is English-only, so dates are pinned to en-US rather than following the
// browser locale — otherwise a Russian-locale browser renders "август 2026 г." beside English labels.
const DATE_LOCALE = "en-US";

export function shortDate(dateKey: string) {
  return parseDate(dateKey).toLocaleDateString(DATE_LOCALE, { month: "short", day: "numeric" });
}

export function rangeLabel(fromDate: string, toDate: string) {
  if (fromDate === toDate) return shortDate(toDate);
  return `${shortDate(fromDate)} – ${shortDate(toDate)}`;
}

export function longDate(dateKey: string) {
  return parseDate(dateKey).toLocaleDateString(DATE_LOCALE, { month: "short", day: "numeric", year: "numeric" });
}

export function longRangeLabel(fromDate: string, toDate: string) {
  return `${longDate(fromDate)} → ${longDate(toDate)}`;
}

export function monthTitle(dateKey: string) {
  return parseDate(dateKey).toLocaleDateString(DATE_LOCALE, { month: "long", year: "numeric" });
}

export function cycleRange(dateKey: string, offset: 0 | -1) {
  const date = parseDate(dateKey);
  let year = date.getFullYear();
  let month = date.getMonth();
  let half: 0 | 1 = date.getDate() <= 15 ? 0 : 1;
  if (offset === -1) {
    if (half === 1) half = 0;
    else {
      half = 1;
      month -= 1;
      if (month < 0) { month = 11; year -= 1; }
    }
  }
  const start = new Date(year, month, half === 0 ? 1 : 16, 12);
  const end = half === 0 ? new Date(year, month, 15, 12) : new Date(year, month + 1, 0, 12);
  return { fromDate: dateKeyFromDate(start), toDate: dateKeyFromDate(end) };
}

export function monthRange(dateKey: string, offset: 0 | -1) {
  const base = addMonths(monthStart(dateKey), offset);
  return { fromDate: monthStart(base), toDate: monthEnd(base) };
}

export function quarterRange(dateKey: string, offset: 0 | -1) {
  const date = parseDate(dateKey);
  const quarterStartMonth = Math.floor(date.getMonth() / 3) * 3 + (offset * 3);
  const start = new Date(date.getFullYear(), quarterStartMonth, 1, 12);
  const end = new Date(start.getFullYear(), start.getMonth() + 3, 0, 12);
  return { fromDate: dateKeyFromDate(start), toDate: dateKeyFromDate(end) };
}

export function compactRangeLabel(range: { fromDate: string; toDate: string }) {
  return `${shortDate(range.fromDate)} – ${shortDate(range.toDate)}`;
}

export function clampRangeToToday(range: { fromDate: string; toDate: string }) {
  const today = todayKey();
  const toDate = clampDateKey(range.toDate, today);
  const fromDate = clampDateKey(range.fromDate, today);
  return normalizeRange(fromDate, toDate);
}

export function calendarDays(monthKey: string) {
  const start = parseDate(monthStart(monthKey));
  const firstWeekday = start.getDay();
  const daysInMonth = parseDate(monthEnd(monthKey)).getDate();
  const cells: Array<string | null> = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(dateKeyFromDate(new Date(start.getFullYear(), start.getMonth(), day, 12)));
  }
  return cells;
}

export function dayLabel(dateKey: string) {
  return parseDate(dateKey).toLocaleDateString(DATE_LOCALE, { weekday: "short", month: "short", day: "numeric" });
}
