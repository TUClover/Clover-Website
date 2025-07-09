import { Chart, registerables } from "chart.js";
import LineChart from "@/components/LineChart";
import StatCard from "@/components/StatCard";
import StackedBarChart from "@/components/StackedBarChart";
import PieChart from "@/components/PieChart";
import { useUserActivity } from "@/hooks/useUserActivity";
import StudentStatusBadge from "@/components/StudentStatusBadge";
import { Loader2 } from "lucide-react";
import { useUserClasses } from "@/hooks/useUserClasses";
import NoData from "@/components/NoData";
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import ClassesDropdownMenu from "@/pages/dashboard/ui/components/ClassesDropdownMenu";

Chart.register(...registerables);

/**
 * StudentStatsView component that displays user activity and progress.
 * @param userData - The user data to display in the dashboard.
 * @returns StudentStatsView component that displays user activity and progress.
 */
const StudentStatsView = () => {
  const { userData } = useUser();

  const {
    classes,
    selectedClassId,
    selectedClassType,
    handleClassSelect,
    selectedClass,
    loading: userClassLoading,
  } = useUserClasses();

  const {
    userActivity,
    progressData,
    loading: userActivityLoading,
  } = useUserActivity(
    userData?.id,
    userData?.settings.mode,
    selectedClassId,
    selectedClassType
  );

  const loading = userClassLoading || userActivityLoading;
  const [dataMode, setDataMode] = useState<"total" | "accepted" | "rejected">(
    "total"
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-10 w-10 dark:text-white" />
      </div>
    );
  }

  const getStatCardData = () => {
    switch (dataMode) {
      case "accepted":
        return {
          total: progressData.totalAccepted,
          correct: progressData.correctSuggestions,
          accuracy: progressData.accuracyPercentage,
          title: "Accepted",
        };
      case "rejected":
        return {
          total: progressData.totalRejected,
          correct: 0,
          accuracy: 0,
          title: "Rejected",
        };
      case "total":
      default:
        return {
          total: progressData.totalInteractions,
          correct: progressData.correctSuggestions,
          accuracy:
            progressData.totalInteractions > 0
              ? (progressData.correctSuggestions /
                  progressData.totalInteractions) *
                100
              : 0,
          title: "Total",
        };
    }
  };

  const statData = getStatCardData();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1"></div>
        <div className="col-span-1 flex items-center justify-end">
          <span
            className={
              selectedClassType === "all" || selectedClassType === "non-class"
                ? "hidden"
                : ""
            }
          >
            <StudentStatusBadge
              status={selectedClass?.student_status || null}
            />
          </span>
        </div>
        <div className="col-span-2 flex justify-end">
          <ClassesDropdownMenu
            classes={classes.map((info) => info.user_class)}
            onClassSelect={handleClassSelect}
            selectedId={selectedClassId}
          />
        </div>
      </div>
      {progressData.totalInteractions === 0 ? (
        <NoData role="student" />
      ) : (
        <div className="">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <StatCard
              title={statData.title}
              value={statData.total}
              tooltipContent={`Total ${dataMode} suggestions.`}
            />
            <StatCard
              title="Correct"
              value={statData.correct}
              tooltipContent={`Number of ${dataMode} suggestions that were correct.`}
            />
            <StatCard
              title="Accuracy"
              value={`${statData.accuracy.toFixed(1)}%`}
              tooltipContent={`Accuracy rate for ${dataMode} suggestions.`}
            />
          </div>

          {/* Charts Row */}
          <div className=" grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <PieChart
              progressData={progressData}
              dataMode={dataMode}
              onDataModeChange={setDataMode}
            />
            <LineChart activities={userActivity} />
          </div>

          {/*Stacked Bar Graph*/}
          <StackedBarChart activities={userActivity} />
        </div>
      )}
    </div>
  );
};

export default StudentStatsView;
