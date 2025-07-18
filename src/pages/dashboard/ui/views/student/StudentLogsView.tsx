import { ACCEPT_EVENTS, REJECT_EVENTS } from "@/types/event";
import { CustomTooltip } from "@/components/CustomTooltip";
import Loading from "@/components/Loading";
import NoData from "@/components/NoData";
import PaginatedTable from "@/components/PaginatedTable";
import SuggestionTable from "@/pages/dashboard/ui/components/SuggestionTable";
import { Card } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import { useUserActivity } from "@/pages/dashboard/hooks/useUserActivity";
import { useUserClasses } from "@/hooks/useUserClasses";
import { UserMode } from "@/types/user";

const StudentLogsView = () => {
  const { userData } = useUser();

  const { selectedClassId, loading: userClassLoading } = useUserClasses();

  const {
    userActivity,
    loading: userActivityLoading,
    progressData,
  } = useUserActivity(userData?.id, userData?.settings.mode, selectedClassId);

  const filteredLogItems = userActivity.filter(
    (logItem) =>
      ACCEPT_EVENTS.includes(logItem.event) ||
      REJECT_EVENTS.includes(logItem.event)
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
        <CustomTooltip
          trigger={
            <h2 className="text-lg font-semibold text-[#50B498]">
              User Insights Table
            </h2>
          }
          children={
            <div className="space-y-2">
              <p className="text-sm">
                This table shows your recent interactions with code suggestions.
              </p>
              <p className="text-xs text-muted-foreground">
                Click on any row to view detailed suggestion information.
              </p>
            </div>
          }
        />
      </div>
      <PaginatedTable
        data={sortedLogItems}
        renderTable={(items, startIndex) => (
          <SuggestionTable
            logItems={items}
            startIndex={startIndex}
            mode={userData?.settings.mode as UserMode}
          />
        )}
      />
    </Card>
  );
};

export default StudentLogsView;
