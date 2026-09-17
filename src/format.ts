import type { DailyStatusMember, DailyStatusValue } from "./types";

export function todayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatLocalTime(value: string | null): string {
  if (!value) return "—";
  return value.slice(0, 5);
}

export function formatStatus(status: DailyStatusValue): string {
  if (status === "on_time") return "On time";
  if (status === "late") return "Late";
  return "Missing";
}

export function statusTone(status: DailyStatusValue): "green" | "amber" | "red" {
  if (status === "on_time") return "green";
  if (status === "late") return "amber";
  return "red";
}

export function summarize(members: DailyStatusMember[]) {
  return members.reduce(
    (acc, member) => {
      acc.total += 1;
      if (member.status === "on_time") acc.onTime += 1;
      else if (member.status === "late") acc.late += 1;
      else acc.missing += 1;
      return acc;
    },
    { total: 0, onTime: 0, late: 0, missing: 0 },
  );
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
