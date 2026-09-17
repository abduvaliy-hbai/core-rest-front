export type DailyStatusValue = "on_time" | "late" | "missing_check_in";

export type DailyStatusOffice = {
  id: string;
  name: string;
  timezone: string;
};

export type DailyStatusMember = {
  employeeId: string;
  displayName: string;
  email: string | null;
  imgUrl: string | null;
  isRemote: boolean;
  timezone: string;
  location: string | null;
  checkedIn: boolean;
  checkInAt: string | null;
  localCheckInTime: string | null;
  status: DailyStatusValue;
};

export type DailyStatusReport = {
  date: string;
  officeId: string | null;
  officeName: string | null;
  members: DailyStatusMember[];
};

export type DailyStatusUserDay = {
  date: string;
  timezone: string;
  location: string | null;
  checkedIn: boolean;
  checkInAt: string | null;
  localCheckInTime: string | null;
  status: DailyStatusValue;
};

export type DailyStatusUserHistory = {
  employeeId: string;
  displayName: string;
  startDate: string;
  endDate: string;
  days: DailyStatusUserDay[];
};

export type StatusFilter = "all" | DailyStatusValue;
