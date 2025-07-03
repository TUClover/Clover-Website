import { Chart, registerables } from "chart.js";
import LineChart from "../../components/LineChart";
import StatCard from "../../components/StatCard";
import StackedBarChart from "../../components/StackedBarChart";
import PieChart from "../../components/PieChart";
import ClassesDropdownMenu from "../../components/ClassesDropdownMenu";
import { useUserActivity } from "../../hooks/useUserActivity";
import StudentStatusBadge from "../../components/StudentStatusBadge";
import { Loader2 } from "lucide-react";
import { useUserClasses } from "../../hooks/useUserClasses";
import RegisterClassDialog from "../../components/RegisterClassDialog";
import { User } from "../../api/types/user";

Chart.register(...registerables);

/**
 * StudentDashboard component that displays user activity and progress.
 * @param userData - The user data to display in the dashboard.
 * @returns StudentDashboard component that displays user activity and progress.
 */
export const StudentDashboard = ({ userData }: { userData: User }) => {
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
  } = useUserActivity(userData.id, selectedClassId, selectedClassType);

  const loading = userClassLoading || userActivityLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-10 w-10 dark:text-white" />
      </div>
    );
  }
  if (progressData.totalAccepted === 0) {
    return (
      <div className="flex justify-center">
        <div className="text-center card">
          <h2 className="text-lg font-semibold text mb-4">No activity found</h2>
          <p className="text-gray-500">
            It seems you haven't accepted any suggestions yet. Start coding to
            see your progress here!
          </p>
          <a
            href="https://clover.nickrucinski.com/download"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block bg-blue-400 dark:bg-blue-500 hover:bg-blue-500 dark:hover:bg-blue-700 hover:scale-105 text-white font-bold py-2 px-4 rounded transition-all"
          >
            Download CLOVER
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1">
          <RegisterClassDialog />
        </div>
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
      <div className="">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Accepted"
            value={progressData.totalAccepted}
            tooltipContent="Total suggestions accepted by the user, including both correct and incorrect suggestions."
          />
          <StatCard
            title="Correct"
            value={progressData.correctSuggestions}
            tooltipContent="Number of accepted suggestions that were actually correct (without bugs)."
          />
          <StatCard
            title="Accuracy"
            value={`${progressData.percentageCorrect.toFixed(2)}%`}
            tooltipContent={`${progressData.percentageCorrect.toFixed(2)}% of accepted suggestions were correct (${progressData.correctSuggestions}/${progressData.totalAccepted})`}
          />
        </div>

        {/* Charts Row */}
        <div className=" grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <PieChart
            correct={progressData.correctSuggestions}
            incorrect={
              progressData.totalAccepted - progressData.correctSuggestions
            }
          />
          <LineChart activities={userActivity} />
        </div>

        {/*Stacked Bar Graph*/}
        <StackedBarChart activities={userActivity} />
      </div>
    </div>
  );
};

export default StudentDashboard;
