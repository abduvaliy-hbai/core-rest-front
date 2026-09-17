import type {
  DailyStatusMember,
  DailyStatusOffice,
  DailyStatusReport,
  DailyStatusUserDay,
  DailyStatusUserHistory,
} from "./types";

// bRide's API responses are snake_case (FastAPI/Pydantic default, no camelCase
// alias generator) and wrap the payload in `{ message, data, ... }` -- unlike
// the DEX reference, which returned camelCase bodies directly. These `map*`
// functions are the adapter boundary; everything past this file stays camelCase.

type RawOffice = { id: string; name: string; timezone: string };

type RawMember = {
  employee_id: string;
  display_name: string;
  email: string | null;
  img_url: string | null;
  is_remote: boolean;
  timezone: string;
  location: string | null;
  checked_in: boolean;
  check_in_at: string | null;
  local_check_in_time: string | null;
  status: DailyStatusMember["status"];
};

type RawReport = {
  date: string;
  office_id: string | null;
  office_name: string | null;
  members: RawMember[];
};

type RawUserDay = {
  date: string;
  timezone: string;
  location: string | null;
  checked_in: boolean;
  check_in_at: string | null;
  local_check_in_time: string | null;
  status: DailyStatusUserDay["status"];
};

type RawUserHistory = {
  employee_id: string;
  display_name: string;
  start_date: string;
  end_date: string;
  days: RawUserDay[];
};

function mapOffice(raw: RawOffice): DailyStatusOffice {
  return { id: raw.id, name: raw.name, timezone: raw.timezone };
}

function mapMember(raw: RawMember): DailyStatusMember {
  return {
    employeeId: raw.employee_id,
    displayName: raw.display_name,
    email: raw.email,
    imgUrl: raw.img_url ?? null,
    isRemote: raw.is_remote,
    timezone: raw.timezone,
    location: raw.location,
    checkedIn: raw.checked_in,
    checkInAt: raw.check_in_at,
    localCheckInTime: raw.local_check_in_time,
    status: raw.status,
  };
}

function mapUserDay(raw: RawUserDay): DailyStatusUserDay {
  return {
    date: raw.date,
    timezone: raw.timezone,
    location: raw.location,
    checkedIn: raw.checked_in,
    checkInAt: raw.check_in_at,
    localCheckInTime: raw.local_check_in_time,
    status: raw.status,
  };
}

export async function fetchOffices(signal?: AbortSignal): Promise<DailyStatusOffice[]> {
  const response = await fetch("/api/daily-status/offices", {
    headers: { accept: "application/json" },
    signal,
  });
  const raw = await readJson<RawOffice[]>(response, "Offices request failed");
  return (raw ?? []).map(mapOffice);
}

export async function fetchDailyStatus(
  date: string,
  officeId: string,
  signal?: AbortSignal,
): Promise<DailyStatusReport> {
  const params = new URLSearchParams({ date });
  if (officeId) params.set("office_id", officeId);
  const response = await fetch(`/api/daily-status?${params.toString()}`, {
    headers: { accept: "application/json" },
    signal,
  });
  const raw = await readJson<RawReport>(response, "Daily status request failed");
  return {
    date: raw.date,
    officeId: raw.office_id,
    officeName: raw.office_name,
    members: raw.members.map(mapMember),
  };
}

export async function fetchUserHistory(
  employeeId: string,
  startDate: string,
  endDate: string,
  signal?: AbortSignal,
): Promise<DailyStatusUserHistory> {
  const params = new URLSearchParams({ user_id: employeeId, start_date: startDate, end_date: endDate });
  const response = await fetch(`/api/daily-status/user?${params.toString()}`, {
    headers: { accept: "application/json" },
    signal,
  });
  const raw = await readJson<RawUserHistory>(response, "Daily status user history request failed");
  return {
    employeeId: raw.employee_id,
    displayName: raw.display_name,
    startDate: raw.start_date,
    endDate: raw.end_date,
    days: raw.days.map(mapUserDay),
  };
}

async function readJson<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    let message = `${fallback} with HTTP ${response.status}`;
    try {
      const payload = (await response.json()) as { error?: string; message?: string };
      message = payload.message || payload.error || message;
    } catch {
      // keep generic HTTP message
    }
    throw new Error(message);
  }
  const payload = (await response.json()) as { data: T };
  return payload.data;
}
