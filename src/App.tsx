import { AnalyticsPanel } from "./components/AnalyticsPanel";
import { PeoplePanel } from "./components/PeoplePanel";
import { RecordsPanel } from "./components/RecordsPanel";
import { Topbar } from "./components/Topbar";
import { useDailyStatusDashboard } from "./hooks/useDailyStatusDashboard";
import { B, SANS } from "./theme";

export default function App() {
  const dashboard = useDailyStatusDashboard();

  return (
    <div
      className="app-root"
      style={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: B.bg,
        display: "flex",
        flexDirection: "column",
        fontFamily: SANS,
      }}
    >
      <div className="app-body" style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div className="pane-people">
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
        </div>

        <div
          className="app-main"
          style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
          <Topbar
            counts={dashboard.currentDayCounts}
            employeeCount={dashboard.report?.members.length ?? 0}
            fromDate={dashboard.fromDate}
            loading={dashboard.reportLoading && !dashboard.report}
            onRangeChange={dashboard.applyRange}
            toDate={dashboard.toDate}
          />

          <div className="app-columns" style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            <div className="pane-records">
              <RecordsPanel
                days={dashboard.visibleDays}
                error={dashboard.historyError}
                loading={dashboard.historyLoading}
                selectedMember={dashboard.selectedMember}
              />
            </div>
            <div className="pane-analytics">
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
    </div>
  );
}
