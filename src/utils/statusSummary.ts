import { formatLocalTime, formatStatus } from "../format";
import { B } from "../theme";
import type { DailyStatusMember, DailyStatusUserDay, DailyStatusValue } from "../types";

export type StatusSummary = {
  total: number;
  onTime: number;
  late: number;
  missed: number;
  onTimeStreak: number;
  lateStreak: number;
  average: string;
  onTimePercent: number;
  latePercent: number;
};

export function statusColor(status: DailyStatusValue): string {
  if (status === "on_time") return B.green;
  if (status === "late") return B.amber;
  return B.red;
}

export function recordCaption(status: DailyStatusValue): string {
  if (status === "on_time") return "on time";
  if (status === "late") return "late arrival";
  return "missed check-in";
}

export function minutesFromTime(value: string | null) {
  if (!value) return null;
  const [hour = "0", minute = "0"] = value.split(":");
  const parsed = Number(hour) * 60 + Number(minute);
  return Number.isFinite(parsed) ? parsed : null;
}

export function averageTime(days: DailyStatusUserDay[]) {
  const values = days
    .map((day) => minutesFromTime(day.localCheckInTime))
    .filter((value): value is number => value !== null);

  if (!values.length) return "—";
  const average = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  return `${String(Math.floor(average / 60)).padStart(2, "0")}:${String(average % 60).padStart(2, "0")}`;
}

// The API returns `days` ascending (start_date -> end_date), so a "current
// streak" counts backwards from the most recent day, not forwards from the
// oldest one.
export function countStreak(days: DailyStatusUserDay[], status: DailyStatusValue) {
  let count = 0;
  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (days[index].status !== status) break;
    count += 1;
  }
  return count;
}

export function summarizeDays(days: DailyStatusUserDay[]): StatusSummary {
  const onTime = days.filter((day) => day.status === "on_time").length;
  const late = days.filter((day) => day.status === "late").length;
  const missed = days.filter((day) => day.status === "missing_check_in").length;
  const total = days.length;

  return {
    total,
    onTime,
    late,
    missed,
    onTimeStreak: countStreak(days, "on_time"),
    lateStreak: countStreak(days, "late"),
    average: averageTime(days),
    onTimePercent: Math.round((onTime / Math.max(total, 1)) * 100),
    latePercent: Math.round((late / Math.max(total, 1)) * 100),
  };
}

export function reportCounts(members: DailyStatusMember[]) {
  return members.reduce(
    (acc, member) => {
      if (member.status === "on_time") acc.onTime += 1;
      else if (member.status === "late") acc.late += 1;
      else acc.missed += 1;
      return acc;
    },
    { onTime: 0, late: 0, missed: 0 },
  );
}

export function displayName(member?: { displayName?: string; email?: string | null } | null) {
  return member?.displayName || member?.email || "No user selected";
}

export function memberMeta(member: DailyStatusMember) {
  const time = member.localCheckInTime ? formatLocalTime(member.localCheckInTime) : "No check-in";
  return `${time} · ${formatStatus(member.status)}`;
}

export function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}
