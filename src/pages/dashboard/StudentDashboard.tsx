import { Chart, registerables } from "chart.js";
import LineChart from "../../components/LineChart";
import StatCard from "../../components/StatCard";
import StackedBarChart from "../../components/StackedBarChart";
import PieChart from "../../components/PieChart";
import ClassesDropdownMenu from "../../components/ClassesDropdownMenu";
import { useUserActivity } from "../../hooks/useUserActivity";
import StudentStatusBadge from "../../components/StudentStatusBadge";
import { Loader2, MoreHorizontal } from "lucide-react";
import { useUserClasses } from "../../hooks/useUserClasses";
import RegisterClassDialog from "../../components/RegisterClassDialog";
import { ClassData, StudentStatus, User } from "../../api/types/user";
import { useMemo, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../components/ui/carousel";
import ClassInfoCard from "../../components/ClassInfoCard";
import ClassDetails from "../../components/ClassDetails";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Skeleton } from "../../components/ui/skeleton";
import { Badge } from "../../components/ui/badge";
import { LogEvent } from "../../api/types/event";
import { Card } from "../../components/ui/card";
import InfoTooltip from "../../components/InfoTooltip";
import PaginatedTable from "../../components/PaginatedTable";
import SuggestionTable from "../../components/SuggestionTable";
import { useAllClasses } from "../../hooks/useAllClasses";
import { Button } from "../../components/ui/button";
import { registerUserToClass } from "../../api/classes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

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

export const UserClasses = () => {
  const { originalClasses, loading: userClassLoading } = useUserClasses();
  const [selectedClass, setSelectedClass] = useState<{
    userClass: ClassData;
    studentStatus?: StudentStatus;
    instructorData?: User;
    studentCount?: number;
  } | null>(null);

  if (userClassLoading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <Loader2 className="size-12 animate-spin" />
      </div>
    );
  }

  const handleClassSelect = (
    userClass: ClassData,
    studentStatus?: StudentStatus,
    instructorData?: User,
    studentCount?: number
  ) => {
    setSelectedClass({
      userClass,
      studentStatus,
      instructorData,
      studentCount,
    });
  };

  const handleCloseDetails = () => {
    setSelectedClass(null);
  };

  return (
    <>
      <div className="width-container grid grid-cols-1 md:grid-cols-5 lg:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-3 lg:col-span-2 space-y-4">
          <div className="card flex w-full justify-center">
            {originalClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 p-16 text-center">
                <p className="text-lg font-medium">
                  You currently have no classes
                </p>
                <p className="text-muted-foreground mb-6">
                  Please register a new class
                </p>
                <RegisterClassDialog />
              </div>
            ) : (
              <Carousel
                opts={{
                  align: "start",
                }}
                className="w-full"
              >
                <CarouselContent>
                  {originalClasses.map((userClassInfo, index) => (
                    <CarouselItem key={index} className="lg:basis-1/2">
                      <div className="p-1">
                        <ClassInfoCard
                          classInfo={userClassInfo}
                          onSelect={handleClassSelect}
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
      </div>

      {selectedClass && (
        <ClassDetails
          userClass={selectedClass.userClass}
          instructorData={selectedClass.instructorData as User}
          onClose={handleCloseDetails}
        />
      )}
    </>
  );
};

export const RegisterClassPage = ({ user }: { user: User }) => {
  const {
    classes: userClasses,
    loading,
    mutate: mutateUserClasses,
  } = useUserClasses();
  const { classes, isLoading } = useAllClasses();

  const userClassMap = useMemo(() => {
    if (!userClasses) return new Map();
    return userClasses.reduce((acc, userClass) => {
      // Use the unique identifier for the class from your userClasses data
      acc.set(userClass.user_class.id, userClass);
      return acc;
    }, new Map());
  }, [userClasses]);

  const registerUser = async (classId: string) => {
    const { error } = await registerUserToClass(user.id, classId);
    if (error) {
      console.error("Error registering user to class:", error);
      return;
    }
    mutateUserClasses();
  };

  return (
    <div className="w-full">
      <div className="py-6">
        <RegisterClassDialog />
      </div>
      <div className="border rounded-md shadow-sm">
        <Table>
          <TableHeader className="bg-[#f5f5f5] dark:bg-[#262626]">
            <TableRow>
              <TableHead className="w-[30%]">Class</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`loading-${i}`}>
                  <TableCell colSpan={3}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No classes found.
                </TableCell>
              </TableRow>
            ) : (
              classes.map((allClass) => {
                const userEnrollment = userClassMap.get(allClass.id);
                return (
                  <TableRow key={allClass.id}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        {allClass.class_image_cover ? (
                          <img
                            src={allClass.class_image_cover}
                            alt="Class cover"
                            className="w-12 h-12 rounded-md object-cover"
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-md"
                            style={{
                              backgroundColor: allClass.class_hex_color,
                            }}
                          />
                        )}
                        <div>
                          <div className="font-medium">
                            {allClass.class_title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {allClass.class_code}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {allClass.instructor_id?.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="text-right">
                      {userEnrollment ? (
                        <Badge variant="secondary">Enrolled</Badge>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onSelect={() => registerUser(allClass.id || "")}
                            >
                              Register
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export const UserLogs = ({ userData }: { userData: User }) => {
  const {
    selectedClassId,
    selectedClassType,
    loading: userClassLoading,
  } = useUserClasses();
  const { userActivity, loading: userActivityLoading } = useUserActivity(
    userData.id,
    selectedClassId,
    selectedClassType
  );

  const filteredLogItems = userActivity.filter(
    (logItem) =>
      logItem.event === LogEvent.SUGGESTION_ACCEPT ||
      logItem.event === LogEvent.USER_REJECT
  );
  const sortedLogItems = filteredLogItems.sort(
    (a, b) =>
      new Date(b.log_created_at).getTime() -
      new Date(a.log_created_at).getTime()
  );

  const loading = userClassLoading || userActivityLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-10 w-10 dark:text-white" />
      </div>
    );
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
              Click on any row to view detailed information about that specific
              suggestion.
            </p>
          </div>
        </InfoTooltip>
      </div>
      <PaginatedTable
        data={sortedLogItems}
        renderTable={(items, startIndex) => (
          <SuggestionTable logItems={items} startIndex={startIndex} />
        )}
      />
    </Card>
  );
};
