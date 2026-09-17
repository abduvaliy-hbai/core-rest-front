import { useCallback, useEffect, useState } from "react";
import { AnalyticsPanel } from "./components/AnalyticsPanel";
import { BackBar } from "./components/BackBar";
import { PeoplePanel } from "./components/PeoplePanel";
import { RecordsPanel } from "./components/RecordsPanel";
import { Topbar } from "./components/Topbar";
import { useBreakpoint } from "./hooks/useBreakpoint";
import { useDailyStatusDashboard } from "./hooks/useDailyStatusDashboard";
import { B, SANS } from "./theme";
import { displayName } from "./utils/statusSummary";

export default function App() {
  const dashboard = useDailyStatusDashboard();
  const breakpoint = useBreakpoint();
  const isPhone = breakpoint === "phone";
  const isStacked = breakpoint !== "desktop";

  // On a phone the roster and the status view are two pages rather than two
  // sections of one scroll.
  const [showDetail, setShowDetail] = useState(false);

  const openDetail = useCallback(
    (employeeId: string) => {
      dashboard.setSelectedId(employeeId);
      if (!isPhone) return;
      setShowDetail(true);
      // A real history entry, so the hardware back gesture leaves the status
      // view instead of leaving the site.
      window.history.pushState({ brideDetail: true }, "");
    },
    [dashboard, isPhone],
  );

  const closeDetail = useCallback(() => {
    if (window.history.state?.brideDetail) window.history.back();
    else setShowDetail(false);
  }, []);

  useEffect(() => {
    const onPopState = () => setShowDetail(false);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Rotating to a wider layout shows every pane at once, so a half-open detail
  // page would strand the history entry.
  useEffect(() => {
    if (!isPhone && showDetail) setShowDetail(false);
  }, [isPhone, showDetail]);

  const peoplePanel = (
    <PeoplePanel
      error={dashboard.error}
      isEmptyReport={dashboard.isEmptyReport}
      isEmptySearch={dashboard.isEmptySearch}
      loading={dashboard.reportLoading}
      members={dashboard.filteredMembers}
      office={dashboard.office}
      offices={dashboard.offices}
      onOfficeChange={dashboard.setOffice}
      onQueryChange={dashboard.setQuery}
      onSelectUser={openDetail}
      query={dashboard.query}
      selectedUserId={isPhone ? undefined : dashboard.selectedMember?.employeeId}
    />
  );

  const recordsPanel = (
    <RecordsPanel
      days={dashboard.visibleDays}
      error={dashboard.historyError}
      loading={dashboard.historyLoading}
      selectedMember={dashboard.selectedMember}
    />
  );

  const analyticsPanel = (
    <AnalyticsPanel
      error={dashboard.historyError}
      fromDate={dashboard.fromDate}
      loading={dashboard.historyLoading}
      rangeDays={dashboard.selectedRangeDays}
      selectedMember={dashboard.selectedMember}
      summary={dashboard.selectedSummary}
      toDate={dashboard.toDate}
    />
  );

  // The status page leads with the summary and puts the day-by-day list under
  // it; side by side, the list reads as the left-hand index into the summary.
  const statusPanels = (
    <>
      {recordsPanel}
      {analyticsPanel}
    </>
  );

  const shell = {
    width: "100%",
    height: isStacked ? "auto" : "100vh",
    minHeight: isStacked ? "100vh" : undefined,
    overflow: isStacked ? "visible" : "hidden",
    background: B.bg,
    display: "flex",
    flexDirection: "column",
    fontFamily: SANS,
  } as const;

  if (isPhone) {
    return (
      <div style={shell}>
        {showDetail ? (
          <>
            <BackBar onBack={closeDetail} title={displayName(dashboard.selectedMember)} />
            {analyticsPanel}
            {recordsPanel}
          </>
        ) : (
          <>
            <Topbar
              counts={dashboard.currentDayCounts}
              employeeCount={dashboard.report?.members.length ?? 0}
              fromDate={dashboard.fromDate}
              loading={dashboard.reportLoading && !dashboard.report}
              onRangeChange={dashboard.applyRange}
              toDate={dashboard.toDate}
            />
            {peoplePanel}
          </>
        )}
      </div>
    );
  }

  return (
    <div style={shell}>
      <div
        style={{
          display: "flex",
          flexDirection: isStacked ? "column" : "row",
          flex: 1,
          minHeight: 0,
          overflow: isStacked ? "visible" : "hidden",
        }}
      >
        {!isStacked && peoplePanel}

        <div
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: isStacked ? "visible" : "hidden",
          }}
        >
          <Topbar
            counts={dashboard.currentDayCounts}
            employeeCount={dashboard.report?.members.length ?? 0}
            fromDate={dashboard.fromDate}
            loading={dashboard.reportLoading && !dashboard.report}
            onRangeChange={dashboard.applyRange}
            toDate={dashboard.toDate}
          />

          {isStacked && peoplePanel}

          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: isStacked ? "column" : "row",
              overflow: isStacked ? "visible" : "hidden",
            }}
          >
            {statusPanels}
          </div>
        </div>
      </div>
    </div>
  );
}
