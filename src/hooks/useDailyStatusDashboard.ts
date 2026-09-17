import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchDailyStatus, fetchOffices, fetchUserHistory } from "../api";
import {
  ALL_OFFICES_VALUE,
  DATE_STORAGE_KEY,
  FROM_DATE_STORAGE_KEY,
  OFFICE_PARAM,
  OFFICE_STORAGE_KEY,
  QUERY_PARAM,
  RANGE_STORAGE_KEY,
  TO_DATE_STORAGE_KEY,
} from "../constants";
import { todayKey } from "../format";
import type { DailyStatusOffice, DailyStatusReport, DailyStatusUserHistory } from "../types";
import {
  addDays,
  dateRangeDays,
  initialDateRange,
  isBeforeDate,
  presetForRange,
} from "../utils/dateRange";
import { displayName, reportCounts, summarizeDays } from "../utils/statusSummary";
import { initialOfficeId, updateSearchParams } from "../utils/urlState";

export function useDailyStatusDashboard() {
  const initialRange = useMemo(initialDateRange, []);
  const [fromDate, setFromDate] = useState(initialRange.fromDate);
  const [toDate, setToDate] = useState(initialRange.toDate);
  const [query, setQueryState] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get(QUERY_PARAM) ?? "";
  });
  const [office, setOfficeState] = useState<string>(() => initialOfficeId());
  const [offices, setOffices] = useState<DailyStatusOffice[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  const [report, setReport] = useState<DailyStatusReport | null>(null);
  const [history, setHistory] = useState<DailyStatusUserHistory | null>(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const historyCache = useRef<Record<string, DailyStatusUserHistory>>({});

  useEffect(() => {
    const controller = new AbortController();
    fetchOffices(controller.signal)
      .then(setOffices)
      .catch(() => setOffices([]));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRefreshTick((tick) => tick + 1);
      const today = todayKey();
      if (!isBeforeDate(toDate, today)) return;
      const days = dateRangeDays(fromDate, toDate);
      setToDate(today);
      setFromDate(addDays(today, -(days - 1)));
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [fromDate, toDate]);

  useEffect(() => {
    historyCache.current = {};
  }, [refreshTick]);

  useEffect(() => {
    const activePreset = presetForRange(fromDate, toDate);
    updateSearchParams((params) => {
      const trimmedQuery = query.trim();
      params.delete("date");
      params.set("from", fromDate);
      params.set("to", toDate);
      if (office) params.set(OFFICE_PARAM, office);
      else params.delete(OFFICE_PARAM);
      if (trimmedQuery) params.set(QUERY_PARAM, trimmedQuery);
      else params.delete(QUERY_PARAM);
      if (activePreset) params.set("range", String(activePreset));
      else params.delete("range");
    });
    window.localStorage.setItem(FROM_DATE_STORAGE_KEY, fromDate);
    window.localStorage.setItem(TO_DATE_STORAGE_KEY, toDate);
    window.localStorage.setItem(DATE_STORAGE_KEY, toDate);
    window.localStorage.setItem(OFFICE_STORAGE_KEY, office);
    if (activePreset) window.localStorage.setItem(RANGE_STORAGE_KEY, String(activePreset));
  }, [fromDate, toDate, office, query]);

  useEffect(() => {
    const controller = new AbortController();
    setReportLoading(true);
    setError(null);

    fetchDailyStatus(toDate, office, controller.signal)
      .then((nextReport) => {
        setReport(nextReport);
        setSelectedId((current) => {
          if (current && nextReport.members.some((member) => member.employeeId === current)) return current;
          return nextReport.members[0]?.employeeId ?? "";
        });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Failed to load daily status data");
        setReport(null);
        setSelectedId("");
      })
      .finally(() => {
        if (!controller.signal.aborted) setReportLoading(false);
      });

    return () => controller.abort();
  }, [toDate, office, refreshTick]);

  const selectedMember = useMemo(
    () => report?.members.find((member) => member.employeeId === selectedId) ?? report?.members[0] ?? null,
    [report, selectedId],
  );

  useEffect(() => {
    if (!selectedMember) {
      setHistory(null);
      return;
    }

    const cacheKey = `${selectedMember.employeeId}:${fromDate}:${toDate}`;
    const cachedHistory = historyCache.current[cacheKey];

    if (cachedHistory) {
      setHistory(cachedHistory);
      setHistoryError(null);
      setHistoryLoading(false);
      return;
    }

    const controller = new AbortController();
    setHistoryLoading(true);
    setHistoryError(null);

    fetchUserHistory(selectedMember.employeeId, fromDate, toDate, controller.signal)
      .then((nextHistory) => {
        historyCache.current[cacheKey] = nextHistory;
        setHistory(nextHistory);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setHistory(null);
        setHistoryError(err instanceof Error ? err.message : "Failed to load user history");
      })
      .finally(() => {
        if (!controller.signal.aborted) setHistoryLoading(false);
      });

    return () => controller.abort();
  }, [selectedMember?.employeeId, fromDate, toDate, refreshTick]);

  const setOffice = useCallback((nextOffice: string) => {
    setOfficeState(nextOffice);
    historyCache.current = {};
  }, []);

  const setQuery = useCallback((nextQuery: string) => {
    setQueryState(nextQuery);
  }, []);

  const applyRange = useCallback((range: { fromDate: string; toDate: string }) => {
    setFromDate(range.fromDate);
    setToDate(range.toDate);
  }, []);

  const filteredMembers = useMemo(() => {
    const search = query.trim().toLowerCase();
    return (report?.members ?? []).filter(
      (member) =>
        !search ||
        displayName(member).toLowerCase().includes(search) ||
        (member.email ?? "").toLowerCase().includes(search),
    );
  }, [query, report?.members]);

  const visibleDays = useMemo(() => history?.days ?? [], [history]);
  const selectedSummary = useMemo(() => summarizeDays(visibleDays), [visibleDays]);
  // Counts describe the office roster, not the search result: search is a
  // find-a-person tool, and a header that changed while typing would read as a
  // roster that shrank.
  const currentDayCounts = useMemo(() => reportCounts(report?.members ?? []), [report?.members]);
  const selectedRangeDays = dateRangeDays(fromDate, toDate);
  const isEmptyReport = !reportLoading && !error && (report?.members.length ?? 0) === 0;
  const isEmptySearch =
    !reportLoading && !error && !isEmptyReport && filteredMembers.length === 0;

  return {
    applyRange,
    currentDayCounts,
    error,
    filteredMembers,
    fromDate,
    historyError,
    historyLoading,
    isEmptyReport,
    isEmptySearch,
    office,
    offices,
    query,
    report,
    reportLoading,
    selectedMember,
    selectedRangeDays,
    selectedSummary,
    setOffice,
    setQuery,
    setSelectedId,
    toDate,
    visibleDays,
  };
}

export const ALL_OFFICES = ALL_OFFICES_VALUE;
