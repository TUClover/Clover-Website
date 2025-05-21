import { useEffect, useState } from "react";
import { useAllUsers } from "../hooks/useAllUsers";
import { useUserClasses, useUserClassStatus } from "../hooks/useUserClasses";
import { Line } from "react-chartjs-2";
import { useAIStats } from "../hooks/useAIStats";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import { AIStats } from "../api/types/suggestion";
import { UserClass, UserData, UserRole } from "../api/types/user";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useUserActivity } from "../hooks/useUserActivity";
import UserSideBar from "../components/UsersSideBar";
import UserDetailsPanel from "../components/UserDetailsPanel";
import DataDownload from "../components/DataDownload";
import { useInstructorClasses } from "../hooks/useInstructorClasses";
import { toast } from "sonner";
import StudentDashboardCard from "../components/StudentDashboardCard";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

/**
 * DevDashboard component
 * This component is responsible for rendering the developer dashboard.
 * It includes a sidebar for user selection, a details panel for user information,
 * and a graph for AI statistics.
 * @returns {JSX.Element} The DevDashboard component.
 */
export const DevDashboard = () => {
  const [selectedUsers, setSelectedUsers] = useState<UserData[]>([]);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<UserClass | null>(null);
  const selectedClassId = selectedClass?.id ?? "all";
  const selectedClassType =
    selectedClass?.id === "all"
      ? "all"
      : selectedClass?.id === "non-class"
        ? "non-class"
        : "class";

  const { users, isLoading, error } = useAllUsers();

  const primaryUser = selectedUsers[0];

  const { classes, loading: userClassesLoading } = useUserClasses(
    primaryUser?.id
  );

  const { userActivity, loading: userActivityLoading } = useUserActivity(
    primaryUser?.id
  );

  const { classes: instructorClasses, loading: instructorLoading } =
    useInstructorClasses(primaryUser?.id);

  const { aiStats } = useAIStats();

  const { userActivity: selectedActivity, progressData } = useUserActivity(
    selectedUserId,
    selectedClassId,
    selectedClassType
  );

  const { studentStatus } = useUserClassStatus(
    selectedUsers[0]?.id || null,
    selectedClass?.id || null
  );

  if (error) {
    toast.error("Error fetching users. Please try again later.");
    return null;
  }

  return (
    <div>
      <div className="w-full mb-6 text-text">
        <AIStatGraph aiStats={aiStats} />
      </div>
      {/* User Section */}
      <div className="flex gap-6 mb-6">
        {/* Sidebar */}
        <UserSideBar
          title="Users"
          users={users}
          selectedUsers={selectedUsers}
          loading={isLoading}
          onSelectUser={(user) => {
            setSelectedUsers([user]);
          }}
          onSetSelectedUsers={setSelectedUsers}
          setSelectedUserId={setSelectedUserId}
        />

        {/* Details Panel */}
        <UserDetailsPanel
          user={selectedUsers}
          userClasses={classes}
          userRole={UserRole.DEV}
          userActivity={userActivity}
          instructorClasses={instructorClasses}
          isLoading={
            isLoading ||
            userClassesLoading ||
            userActivityLoading ||
            instructorLoading
          }
          setSelectedClass={setSelectedClass}
        />
      </div>
      {/* Data Download Section */}
      <div className="w-full mb-3 text-text">
        <DataDownload />
      </div>

      {selectedClass && selectedUserId && (
        <StudentDashboardCard
          student={{
            fullName: `${selectedUsers[0].firstName} ${selectedUsers[0].lastName}`,
            classTitle: selectedClass.classTitle,
            studentStatus:
              selectedClassId !== "all" && selectedClassId !== "non-class"
                ? studentStatus
                : null,
            totalAccepted: progressData.totalAccepted,
            correctSuggestions: progressData.correctSuggestions,
            percentageCorrect: progressData.percentageCorrect,
            logs: selectedActivity,
          }}
          onClose={() => setSelectedClass(null)}
        />
      )}
    </div>
  );
};

export default DevDashboard;

/**
 * AIStatGraph component
 * Only available in the developer dashboard.
 * @param {aiStats[]} The AI statistics data to be displayed in the graph.
 * @returns {JSX.Element} - The AIStatGraph component.
 */
export const AIStatGraph = ({
  aiStats,
}: {
  aiStats: AIStats[] | undefined;
}) => {
  useEffect(() => {
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setTextColor(isDarkMode ? "#FFFFFF" : "#000000");
      setGridColor(isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)");
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const [textColor, setTextColor] = useState("#000000");
  const [gridColor, setGridColor] = useState("rgba(255,255,255,0.1)");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const filteredStats = aiStats?.filter((stat) => {
    const date = new Date(stat.created_at);
    return (!startDate || date >= startDate) && (!endDate || date <= endDate);
  });

  // const groupedStats = aiStats?.reduce((acc, stat) => {
  //   const dateKey = new Date(stat.created_at).toLocaleDateString();
  //   acc[dateKey] = (acc[dateKey] || 0) + stat.total_tokens;
  //   return acc;
  // }, {} as Record<string, number>);

  const chartData = {
    // labels: Object.keys(groupedStats || {}),
    labels:
      filteredStats?.map((stat) =>
        new Date(stat.created_at).toLocaleDateString()
      ) ?? [],
    datasets: [
      {
        label: "Total Tokens Used",
        // data: Object.values(groupedStats || {}),
        data: filteredStats?.map((stat) => stat.total_tokens) ?? [],
        borderColor: "#50B498",
        backgroundColor: "rgba(80, 180, 152, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: textColor },
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
        },
        grid: { color: gridColor },
      },
      y: {
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
    },
  };

  return (
    <div className="w-full h-auto bg-white dark:bg-black border border-gray-600 dark:border-gray-400 rounded-lg shadow p-4 pb-12">
      {/* Header with responsive flex layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 px-2">
        <h2 className="text-lg font-semibold">AI Stats</h2>

        {/* Date pickers with responsive layout */}
        <div className="flex flex-col xs:flex-row gap-2 sm:gap-4 items-start xs:items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500 whitespace-nowrap w-12">
              From:
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="dark:bg-black border text-sm w-full min-w-[120px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500 whitespace-nowrap w-12">
              To:
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className="dark:bg-black border text-sm w-full min-w-[120px]"
            />
          </div>
        </div>
      </div>

      {/* Responsive chart container */}
      <div
        className="relative w-full"
        style={{ height: "clamp(200px, 30vh, 400px)" }}
      >
        <Line
          data={chartData}
          options={{
            ...chartOptions,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              ...chartOptions.plugins,
              legend: {
                ...chartOptions.plugins?.legend,
                position: "bottom",
              },
            },
          }}
        />
      </div>
    </div>
  );
};
