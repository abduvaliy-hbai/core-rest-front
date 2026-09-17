import { AnalyticsPanel } from "./components/AnalyticsPanel";
import { PeoplePanel } from "./components/PeoplePanel";
import { RecordsPanel } from "./components/RecordsPanel";
import { Topbar } from "./components/Topbar";
import { useBreakpoint } from "./hooks/useBreakpoint";
import { useDailyStatusDashboard } from "./hooks/useDailyStatusDashboard";
import { B, SANS } from "./theme";

export default function App() {
  const dashboard = useDailyStatusDashboard();
  const isStacked = useBreakpoint() !== "desktop";

  return (
    <div
      style={{
        width: "100%",
        // Stacked, the page itself scrolls; on desktop each pane scrolls inside
        // a viewport-locked shell.
        height: isStacked ? "auto" : "100vh",
        minHeight: isStacked ? "100vh" : undefined,
        overflow: isStacked ? "visible" : "hidden",
        background: B.bg,
        display: "flex",
        flexDirection: "column",
        fontFamily: SANS,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isStacked ? "column" : "row",
          flex: 1,
          minHeight: 0,
          overflow: isStacked ? "visible" : "hidden",
        }}
      >
        {!isStacked && (
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
            onSelectUser={dashboard.setSelectedId}
            query={dashboard.query}
            selectedUserId={dashboard.selectedMember?.employeeId}
          />
        )}

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

          {/* Stacked, the roster belongs under the header rather than above it:
              the header carries the date range that every pane below depends on. */}
          {isStacked && (
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
              onSelectUser={dashboard.setSelectedId}
              query={dashboard.query}
              selectedUserId={dashboard.selectedMember?.employeeId}
            />
          )}

          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: isStacked ? "column" : "row",
              overflow: isStacked ? "visible" : "hidden",
            }}
          >
            <RecordsPanel
              days={dashboard.visibleDays}
              error={dashboard.historyError}
              loading={dashboard.historyLoading}
              selectedMember={dashboard.selectedMember}
            />
            <AnalyticsPanel
              error={dashboard.historyError}
              fromDate={dashboard.fromDate}
              loading={dashboard.historyLoading}
              rangeDays={dashboard.selectedRangeDays}
              selectedMember={dashboard.selectedMember}
              summary={dashboard.selectedSummary}
              toDate={dashboard.toDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
