import DecisionLineChart from "@/pages/dashboard/ui/components/DecisionLineChart";
import StatCard from "@/components/StatCard";
import AccuracyDistributionBarChart from "@/pages/dashboard/ui/components/AccuracyDistributionBarChart";
import AccuracyPieChart from "@/pages/dashboard/ui/components/AccuracyPieChart";
import { useUserActivity } from "@/pages/dashboard/hooks/useUserActivity";
import { useUserClasses } from "@/hooks/useUserClasses";
import NoData from "@/components/NoData";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import ClassesDropdownMenu from "@/pages/dashboard/ui/components/ClassesDropdownMenu";
import Loading from "@/components/Loading";
import LearningProgressChart from "@/pages/dashboard/ui/components/LearningProgressChart";
import AccuracyTimeLineChart from "@/pages/dashboard/ui/components/AccuracyTimeLineChart";
import ResponseTimeBarChart from "@/pages/dashboard/ui/components/ResponseTimeBarChart";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * StudentStatsView component that displays user activity and progress.
 * @param userData - The user data to display in the dashboard.
 * @returns StudentStatsView component that displays user activity and progress.
 */
const StudentStatsView = ({ description }: { description?: string }) => {
  const { userData } = useUser();

  const location = useLocation();
  const navigate = useNavigate();
  const preselectedClassId = location.state?.preselectedClassId;

  useEffect(() => {
    if (preselectedClassId) {
      navigate(location.pathname, { replace: true });
    }
  }, [preselectedClassId, location.pathname, navigate]);

  const {
    allClassOptions,
    selectedClassId,
    handleClassSelect,
    loading: userClassLoading,
  } = useUserClasses(userData?.id, preselectedClassId || "all");

  const {
    userActivity,
    progressData,
    loading: userActivityLoading,
  } = useUserActivity(userData?.id, userData?.settings.mode, selectedClassId);

  const loading = userClassLoading || userActivityLoading;

  const [pieChartData, setPieChartData] = useState<{
    mode: "total" | "accepted" | "rejected";
    statData: {
      total: number;
      correct: number;
      accuracy: number;
      title: string;
    };
  } | null>(null);

  useEffect(() => {
    if (preselectedClassId && location.state) {
      window.history.replaceState({}, document.title);
    }
  }, [preselectedClassId, location.state]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" text="Loading your data" />
      </div>
    );
  }

  const statData = pieChartData?.statData || {
    total: progressData.totalInteractions,
    correct: progressData.correctSuggestions,
    accuracy:
      progressData.totalInteractions > 0
        ? (progressData.correctSuggestions / progressData.totalInteractions) *
          100
        : 0,
    title: "Total",
  };

  const currentMode = pieChartData?.mode || "total";

  return (
    <div className="space-y-8">
      <div className="flex w-full justify-between gap-6 items-center">
        <p className="text-sm text-muted-foreground hidden md:block">
          {description}
        </p>
        <div className="w-full md:w-80">
          <ClassesDropdownMenu
            classes={allClassOptions}
            onClassSelect={handleClassSelect}
            selectedId={selectedClassId}
          />
        </div>
      </div>
      {progressData.totalInteractions === 0 ? (
        <NoData role="student" />
      ) : (
        <div className="space-y-8">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <StatCard
              title={statData.title}
              value={statData.total}
              tooltipContent={`Total ${currentMode === "total" ? "interactions with " : currentMode} suggestions.`}
            />
            <StatCard
              title="Correct"
              value={statData.correct}
              tooltipContent={`Number of ${currentMode} suggestions that were correct.`}
            />
            <StatCard
              title="Accuracy"
              value={`${statData.accuracy.toFixed(1)}%`}
              tooltipContent={`Accuracy rate for ${currentMode} suggestions.`}
            />
          </div>

          <div className=" grid grid-cols-1 sm:grid-cols-2 gap-6">
            <AccuracyPieChart
              progressData={progressData}
              onDataChange={setPieChartData}
            />
            <DecisionLineChart activities={userActivity} />
          </div>

          <AccuracyDistributionBarChart activities={userActivity} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ResponseTimeBarChart
              userActivity={userActivity}
              title="Average Response Time"
            />

            <AccuracyTimeLineChart userActivity={userActivity} />
          </div>

          <LearningProgressChart
            userActivity={userActivity}
            windowSize={20}
            title="Learning Progress"
          />
        </div>
      )}
    </div>
  );
};

export default StudentStatsView;
