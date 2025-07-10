import { getEventsForMode } from "@/api/types/event";
import InfoTooltip from "@/components/InfoTooltip";
import Loading from "@/components/Loading";
import NoData from "@/components/NoData";
import PaginatedTable from "@/components/PaginatedTable";
import SuggestionTable from "@/components/SuggestionTable";
import { Card } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import { useUserActivity } from "@/hooks/useUserActivity";
import { useUserClasses } from "@/hooks/useUserClasses";

const UserLogsView = () => {
  const { userData } = useUser();

  const { selectedClassId, loading: userClassLoading } = useUserClasses();

  const {
    userActivity,
    loading: userActivityLoading,
    progressData,
  } = useUserActivity(userData?.id, userData?.settings.mode, selectedClassId);

  const events = getEventsForMode(userData?.settings.mode || "CODE_BLOCK");

  const filteredLogItems = userActivity.filter(
    (logItem) =>
      logItem.event === events?.accept || logItem.event === events?.reject
  );

  const sortedLogItems = filteredLogItems.sort(
    (a, b) =>
      new Date(b.createdAt || b.createdAt).getTime() -
      new Date(a.createdAt || a.createdAt).getTime()
  );

  const loading = userClassLoading || userActivityLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" text="Loading your data" />
      </div>
    );
  }

  if (progressData.totalInteractions === 0) {
    return <NoData role="student" />;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center mb-3 gap-3">
        <h2 className="text-lg font-semibold text-[#50B498]">
          User Insights Table
        </h2>
        <InfoTooltip>
          <div className="text-sm space-y-2">
            <p>
              The table displays each student's individual decisions on code
              suggestions — including whether they accepted them and if the
              suggestions contained bugs.
            </p>
            <p className="text-xs text-muted-foreground">
              • <strong>Correct:</strong> Accepting good suggestions or
              rejecting bad ones
              <br />• <strong>Incorrect:</strong> Accepting bad suggestions or
              rejecting good ones
              <br />• Click any row to view detailed suggestion information
            </p>
          </div>
        </InfoTooltip>
      </div>
      <PaginatedTable
        data={sortedLogItems}
        renderTable={(items, startIndex) => (
          <SuggestionTable
            logItems={items}
            startIndex={startIndex}
            mode={userData?.settings.mode || "CODE_BLOCK"}
          />
        )}
      />
    </Card>
  );
};

export default UserLogsView;
