import ClassesDropdownMenu from "../../components/ClassesDropdownMenu";
import { useClassActivity } from "../../hooks/useClassActivity";
import StatCard from "../../components/StatCard";
import PieChart from "../../components/PieChart";
import LineChart from "../../components/LineChart";
import { useInstructorClasses } from "../../hooks/useInstructorClasses";
import StackedBarChart from "../../components/StackedBarChart";
import CreateNewClassDialog from "../../components/CreateNewClassDialog";
import {
  ActiveUserMode,
  ClassData,
  StudentStatus,
  User,
  UserMode,
  UserRole,
} from "../../api/types/user";
import { Card } from "../../components/ui/card";
import InfoTooltip from "../../components/InfoTooltip";
import StudentDataTable from "../../components/StudentDataTable";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../components/ui/carousel";
import ClassInfoCard from "../../components/ClassInfoCard";
import ClassDetails from "../../components/ClassDetails";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import NoData from "../../components/NoData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

/**
 * InstructorDashboard component displays the instructor dashboard with class statistics and activity logs.
 * It includes a dropdown menu for selecting classes, a pie chart for class decision overview,
 * @param { userData } - The user data of the instructor.
 * @returns
 */
export const InstructorDashboard = ({ userData }: { userData: User }) => {
  const [selectedMode, setSelectedMode] = useState<ActiveUserMode>(
    userData.settings.mode as ActiveUserMode
  );

  const { classes, selectedClassId, handleClassSelect } = useInstructorClasses(
    userData.id
  );

  const { allActivity, classActivity, progressData, loading, error } =
    useClassActivity(userData.id, selectedClassId, selectedMode);

  const selectedClassTitle =
    classes.find((classItem) => classItem.id === selectedClassId)
      ?.class_title ?? "";

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

  if (error) {
    return (
      <div className="flex justify-center mt-10">
        <div className="text-center p-6 border rounded-lg">
          <h2 className="text-lg font-semibold text-red-600 mb-4">
            Error Loading Data
          </h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
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
    <div>
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="col-span-1"></div>
        <div className="col-span-1" />
        <div className="col-span-2 flex items-center justify-end gap-4">
          <div className="flex items-center gap-2">
            <Select
              value={selectedMode as string}
              onValueChange={(value: ActiveUserMode) => setSelectedMode(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserMode.BLOCK}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded bg-blue-500"></div>
                    Code Block
                  </div>
                </SelectItem>
                <SelectItem value={UserMode.LINE}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded bg-green-500"></div>
                    Line by Line
                  </div>
                </SelectItem>
                <SelectItem value={UserMode.SELECTION}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded bg-purple-500"></div>
                    Code Selection
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ClassesDropdownMenu
            classes={classes}
            selectedId={selectedClassId}
            onClassSelect={handleClassSelect}
          />
        </div>
      </div>

      {classes.length > 0 ? (
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
            <PieChart
              progressData={progressData}
              dataMode={dataMode}
              onDataModeChange={setDataMode}
            />
            <LineChart
              activities={
                selectedClassId === "all" ? allActivity : classActivity
              }
            />
          </div>

          {/* Stacked Bar Graph */}
          <StackedBarChart
            activities={selectedClassId === "all" ? allActivity : classActivity}
          />
        </div>
      ) : (
        <NoData />
      )}
    </div>
  );
};

export default InstructorDashboard;

export const InstructorStudents = ({ userData }: { userData: User }) => {
  const { classes, selectedClassId } = useInstructorClasses(userData.id);

  const { allActivity } = useClassActivity(
    userData.id,
    selectedClassId,
    userData.settings.mode
  );

  const selectedClassTitle =
    classes.find((classItem) => classItem.id === selectedClassId)
      ?.class_title ?? "";

  return (
    <Card className="p-6 mt-8">
      <div className="flex items-center mb-2 gap-3">
        <h2 className="text-md font-semibold text-primary">
          Insights About Students
        </h2>
        <InfoTooltip>
          <div className="text-sm space-y-2">
            <p>
              The table shows insights from{" "}
              <span className="text-primary font-semibold">
                {selectedClassTitle}
              </span>
              , summarizing student decisions on code suggestions and their
              accuracy.
            </p>
            <p className="text-xs text-muted-foreground">
              Click on any row to view student-specific suggestions and
              performance details.
            </p>
          </div>
        </InfoTooltip>
      </div>
      <StudentDataTable
        logs={allActivity}
        classFilter={selectedClassTitle === "all classes" ? "all" : "class"}
      />
    </Card>
  );
};

export const InstructorClasses = ({ userData }: { userData: User }) => {
  const { originalClasses, loading: userClassLoading } = useInstructorClasses();
  const [selectedClass, setSelectedClass] = useState<{
    userClass: ClassData;
    studentStatus?: StudentStatus;
    instructorData?: User;
  } | null>(null);

  const handleCloseDetails = () => {
    setSelectedClass(null);
  };
  const handleClassSelect = (
    userClass: ClassData,
    studentStatus?: StudentStatus,
    instructorData?: User
  ) => {
    setSelectedClass({
      userClass,
      studentStatus,
      instructorData,
    });
  };

  if (userClassLoading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <Loader2 className="size-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-5 lg:grid-cols-3 gap-6">
      <div className="col-span-11 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Your Classes</h2>
          <CreateNewClassDialog />
        </div>

        <div className="w-full">
          {originalClasses.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-16 text-center">
              <p className="text-lg font-medium">No classes yet</p>
              <p className="text-muted-foreground">
                Click "Create Class" to get started.
              </p>
            </div>
          ) : (
            <Carousel
              opts={{
                align: "center",
              }}
              className="w-full"
            >
              <CarouselContent>
                {originalClasses.map((userClass, index) => (
                  <CarouselItem key={index} className="lg:basis-1/3">
                    <div className="p-1">
                      <ClassInfoCard
                        classInfo={userClass}
                        onSelect={handleClassSelect}
                        isInstructor={
                          userData.role === UserRole.INSTRUCTOR ||
                          userData.role === UserRole.ADMIN
                        }
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {originalClasses.length > 1 && (
                <div
                  className={`flex justify-between w-full pt-4 ${
                    originalClasses.length <= 2 && "lg:hidden"
                  }`}
                >
                  <CarouselPrevious className="static translate-x-0 translate-y-0 ml-4" />
                  <CarouselNext className="static translate-x-0 translate-y-0 mr-4" />
                </div>
              )}
            </Carousel>
          )}
        </div>
      </div>

      {selectedClass && (
        <ClassDetails
          userClass={selectedClass.userClass}
          instructorData={selectedClass.instructorData as User}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};
