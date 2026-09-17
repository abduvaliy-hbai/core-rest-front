export type RangeDays = 7 | 14 | 30;

export const RANGE_OPTIONS: RangeDays[] = [7, 14, 30];
export const RANGE_STORAGE_KEY = "attendance-dashboard-range-days";
export const DATE_STORAGE_KEY = "attendance-dashboard-selected-date";
export const FROM_DATE_STORAGE_KEY = "attendance-dashboard-from-date";
export const TO_DATE_STORAGE_KEY = "attendance-dashboard-to-date";

// bRide has real, server-configured offices (Tashkent, Namangan, Incheon, ...)
// fetched from GET /daily-status/offices -- unlike the DEX reference dashboard,
// which had a fixed two-country enum, so there is no static option list here.
// "" means "all offices".
export const ALL_OFFICES_VALUE = "";
export const OFFICE_STORAGE_KEY = "attendance-dashboard-office-id";
export const OFFICE_PARAM = "office";
export const QUERY_PARAM = "q";
