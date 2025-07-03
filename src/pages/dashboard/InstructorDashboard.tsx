import ClassesDropdownMenu from "../../components/ClassesDropdownMenu";
import { useClassActivity } from "../../hooks/useClassActivity";
import StatCard from "../../components/StatCard";
import PieChart from "../../components/PieChart";
import LineChart from "../../components/LineChart";
import { useInstructorClasses } from "../../hooks/useInstructorClasses";
import StackedBarChart from "../../components/StackedBarChart";
import CreateNewClassDialog from "../../components/CreateNewClassDialog";
import {
  ClassData,
  StudentStatus,
  User,
  UserActivityLogItem,
  UserRole,
} from "../../api/types/user";
import { ProgressData } from "../../utils/calculateProgress";
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

export const InstructorStudents = ({ userData }: { userData: User }) => {
  const { classes, selectedClassId } = useInstructorClasses(userData.id);

  const { allActivity } = useClassActivity(classes, selectedClassId);

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
    <div className="width-container grid grid-cols-1 md:grid-cols-5 lg:grid-cols-3 gap-6">
      <div className="col-span-1 md:col-span-3 lg:col-span-2 space-y-4">
        <div className="card flex w-full justify-center">
          {originalClasses.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-16 text-center">
              <p className="text-lg font-medium">
                You currently have no classes
              </p>
              <p className="text-muted-foreground mb-6">
                Please create a new class
              </p>
              <CreateNewClassDialog />
            </div>
          ) : (
            <Carousel
              opts={{
                align: "start",
              }}
              className="w-full"
            >
              <CarouselContent>
                {originalClasses.map((userClass, index) => (
                  <CarouselItem key={index} className="lg:basis-1/2">
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
                  className={`flex justify-between w-full ${originalClasses.length <= 2 && "lg:hidden"}`}
                >
                  <CarouselPrevious className="ml-4" />
                  <CarouselNext className="mr-4" />
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
