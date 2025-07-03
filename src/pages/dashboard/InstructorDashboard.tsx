import ClassesDropdownMenu from "../../components/ClassesDropdownMenu";
import { useClassActivity } from "../../hooks/useClassActivity";
import StatCard from "../../components/StatCard";
import PieChart from "../../components/PieChart";
import LineChart from "../../components/LineChart";
import { useInstructorClasses } from "../../hooks/useInstructorClasses";
import StackedBarChart from "../../components/StackedBarChart";
import CreateNewClassDialog from "../../components/CreateNewClassDialog";
import { User, UserActivityLogItem } from "../../api/types/user";
import { ProgressData } from "../../utils/calculateProgress";

/**
 * InstructorDashboard component displays the instructor dashboard with class statistics and activity logs.
 * It includes a dropdown menu for selecting classes, a pie chart for class decision overview,
 * @param { userData } - The user data of the instructor.
 * @returns
 */
export const InstructorDashboard = ({ userData }: { userData: User }) => {
  const { classes, selectedClassId, handleClassSelect } = useInstructorClasses(
    userData.id
  );

  const { allActivity, classActivity, progressData } = useClassActivity(
    classes,
    selectedClassId
  );

  const selectedClassTitle =
    classes.find((classItem) => classItem.id === selectedClassId)
      ?.class_title ?? "";

  return (
    <div>
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="col-span-1">
          <CreateNewClassDialog />
        </div>
        <div className="col-span-1" />
        <div className="col-span-2 flex items-center justify-end">
          <ClassesDropdownMenu
            classes={classes}
            selectedId={selectedClassId}
            onClassSelect={handleClassSelect}
          />
        </div>
      </div>

      {classes.length > 0 ? (
        <ClassAnalytics
          activities={selectedClassId === "all" ? allActivity : classActivity}
          progressData={progressData}
          classInfo={
            selectedClassId === "all" ? "all classes" : selectedClassTitle
          }
        />
      ) : (
        <div className="flex justify-center mt-10">
          <div className="text-center p-6 border rounded-lg">
            <h2 className="text-lg font-semibold text mb-4">
              No Activity Found
            </h2>
            <p className="text-muted-foreground">
              You have not created any classes yet. Please create a class to
              view activity and insights.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;

// You could place this in the same file or a new one.
const ClassAnalytics = ({
  activities,
  progressData,
}: {
  activities: UserActivityLogItem[];
  progressData: ProgressData;
  classInfo: string;
}) => (
  <>
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
        tooltipContent={`${progressData.percentageCorrect.toFixed(
          2
        )}% of accepted suggestions were correct (${
          progressData.correctSuggestions
        }/${progressData.totalAccepted})`}
      />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
      <PieChart
        correct={progressData.correctSuggestions}
        incorrect={progressData.totalAccepted - progressData.correctSuggestions}
      />
      <LineChart activities={activities} />
    </div>
    <StackedBarChart activities={activities} />
  </>
);
