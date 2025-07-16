import { UserMode } from "@/types/user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/UserContext";
import { useClassActivity } from "@/hooks/useClassActivity";
import { useInstructorClasses } from "@/hooks/useInstructorClasses";
import { useEffect, useState } from "react";
import ClassesDropdownMenu from "@/pages/dashboard/ui/components/ClassesDropdownMenu";
import StatCard from "@/components/StatCard";
import AccuracyPieChart from "@/pages/dashboard/ui/components/AccuracyPieChart";
import AccuracyDistributionBarChart from "@/pages/dashboard/ui/components/AccuracyDistributionBarChart";
import NoData from "@/components/NoData";
import Loading from "@/components/Loading";
import DecisionLineChart from "@/pages/dashboard/ui/components/DecisionLineChart";
import ResponseTimeBarChart from "@/pages/dashboard/ui/components/ResponseTimeBarChart";
import AccuracyTimeLineChart from "@/pages/dashboard/ui/components/AccuracyTimeLineChart";
import { useLocation, useNavigate } from "react-router-dom";

const InstructorStatsView = () => {
  const { userData } = useUser();

  const location = useLocation();
  const navigate = useNavigate();
  const preselectedClassId = location.state?.preselectedClassId;

  useEffect(() => {
    if (preselectedClassId) {
      navigate(location.pathname, { replace: true });
    }
  }, [preselectedClassId, location.pathname, navigate]);

  const [selectedMode, setSelectedMode] = useState<UserMode>(
    userData?.settings.mode as UserMode
  );

  const { allClassOptions, selectedClassId, handleClassSelect } =
    useInstructorClasses(userData?.id, preselectedClassId);

  const { allActivity, classActivity, progressData, loading } =
    useClassActivity(userData?.id as string, selectedClassId, selectedMode);

  const selectedClassTitle =
    allClassOptions.find((classItem) => classItem.id === selectedClassId)
      ?.classTitle ?? "";

  const [dataMode, setDataMode] = useState<"total" | "accepted" | "rejected">(
    "total"
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" showText={false} />
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
      <div className="col-span-2 flex items-center justify-end gap-4">
        <div className="flex items-center gap-2 justify-end w-full">
          <Select
            value={selectedMode as string}
            onValueChange={(value: UserMode) => setSelectedMode(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UserMode.CODE_BLOCK}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded bg-blue-500"></div>
                  Code Block
                </div>
              </SelectItem>
              <SelectItem value={UserMode.LINE_BY_LINE}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded bg-green-500"></div>
                  Line by Line
                </div>
              </SelectItem>
              <SelectItem value={UserMode.CODE_SELECTION}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded bg-purple-500"></div>
                  Code Selection
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ClassesDropdownMenu
          classes={allClassOptions}
          selectedId={selectedClassId}
          onClassSelect={handleClassSelect}
        />
      </div>

      {progressData.totalInteractions > 0 ? (
        <div className="">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <StatCard
              title={statData.title}
              value={statData.total}
              tooltipContent={`Total ${dataMode} suggestions across ${
                selectedClassId === "all" ? "all classes" : selectedClassTitle
              }.`}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <AccuracyPieChart
              progressData={progressData}
              dataMode={dataMode}
              onDataModeChange={setDataMode}
            />
            <DecisionLineChart
              activities={
                selectedClassId === "all" ? allActivity : classActivity
              }
            />
          </div>

          <AccuracyDistributionBarChart
            activities={selectedClassId === "all" ? allActivity : classActivity}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ResponseTimeBarChart
              userActivity={allActivity}
              title="Average Response Time"
            />

            <AccuracyTimeLineChart userActivity={allActivity} />
          </div>
        </div>
      ) : (
        <NoData role="instructor" />
      )}
    </div>
  );
};

export default InstructorStatsView;
