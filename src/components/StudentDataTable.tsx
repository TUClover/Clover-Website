import { useMemo, useState } from "react";
import MiniPieChart from "./MiniPieChart";
import { UserMode, ProgressData } from "@/types/user";
import PaginatedTable from "./PaginatedTable";
import StudentDashboardCard from "./StudentDashboardCard";
import { useStudentData } from "@/hooks/useUserData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { InstructorLogResponse } from "@/api/classes";
import { Card, CardContent } from "./ui/card";
import UserDataSearchFilters from "@/pages/dashboard/ui/components/UserDataSearchFilter";
import UserInfoTableCard from "@/pages/dashboard/ui/components/UserInfoTableCard";
import { formatActivityTimestamp, isOnline } from "@/lib/utils";
import ModeBadge from "./ModeBadge";

export interface StudentClassData {
  userId: string;
  fullName?: string;
  classId?: string;
  classTitle: string;
  totalAccepted: number;
  totalRejected: number;
  totalInteractions: number;
  correctSuggestions: number;
  accuracyPercentage: number;
  lastActivity: string;
  mode: UserMode;
  logs?: InstructorLogResponse[];
}

interface StudentDataTableProps {
  instructorId: string;
}

export const StudentDataTable = ({ instructorId }: StudentDataTableProps) => {
  const [selectedStudent, setSelectedStudent] =
    useState<StudentClassData | null>(null);
  const [nameFilter, setNameFilter] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<UserMode | "all">("all");

  // Use the custom hook to fetch student data
  const { students, classOptions, isLoading, error } = useStudentData({
    instructorId,
    classFilter,
    modeFilter,
  });

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchName = student
        .fullName!.toLowerCase()
        .includes(nameFilter.toLowerCase());

      const matchClass =
        classFilter === "all" || student.classId === classFilter;

      return matchName && matchClass;
    });
  }, [students, nameFilter, classFilter]);

  const handleRowClick = (student: StudentClassData) => {
    setSelectedStudent(student);
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
  };

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-red-500 text-center py-8">
          Error loading student data: {error}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <UserDataSearchFilters
          nameFilter={nameFilter}
          setNameFilter={setNameFilter}
          modeFilter={modeFilter}
          setModeFilter={setModeFilter}
          classFilter={classFilter}
          setClassFilter={setClassFilter}
          classOptions={classOptions}
          className="space-y-4"
          gridClassName="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
        />
        {/* Loading skeleton for mobile cards */}
        <div className="block md:hidden space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={`loading-card-${index}`} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-3"></div>
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Loading skeleton for desktop table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[5%]">No.</TableHead>
                <TableHead className="w-[30%]">Class</TableHead>
                <TableHead className="w-[20%]">Name</TableHead>
                <TableHead className="w-[15%]">Accuracy</TableHead>
                <TableHead className="w-[20%]">Last Active</TableHead>
                <TableHead className="w-[10%]">Mode</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <StudentRow
                  key={`loading-${index}`}
                  student={{
                    userId: "",
                    classTitle: "",
                    totalAccepted: 0,
                    totalRejected: 0,
                    totalInteractions: 0,
                    correctSuggestions: 0,
                    accuracyPercentage: 0,
                    lastActivity: new Date().toISOString(),
                    mode: UserMode.LINE_BY_LINE,
                  }}
                  index={index}
                  isLoading={true}
                  onClick={() => {}}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 my-4">
        <UserDataSearchFilters
          nameFilter={nameFilter}
          setNameFilter={setNameFilter}
          modeFilter={modeFilter}
          setModeFilter={setModeFilter}
          classFilter={classFilter}
          setClassFilter={setClassFilter}
          classOptions={classOptions}
          className="space-y-4"
          gridClassName="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
        />
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        <PaginatedTable
          data={filteredStudents}
          renderTable={(currentItems, startIndex) => (
            <div className="space-y-3">
              {currentItems.map((student, index) => (
                <UserInfoTableCard
                  key={`${student.userId}-${student.classId}-${index}`}
                  index={startIndex + index}
                  name={student.fullName || "Unknown User"}
                  onClick={() => handleRowClick(student)}
                  totalAccepted={student.totalAccepted}
                  totalRejected={student.totalRejected}
                  totalInteractions={student.totalInteractions}
                  correctSuggestions={student.correctSuggestions}
                  accuracyPercentage={student.accuracyPercentage}
                  lastActivity={student.lastActivity}
                  classTitle={student.classTitle}
                  mode={student.mode as UserMode}
                />
              ))}
            </div>
          )}
        />
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <PaginatedTable
          data={filteredStudents}
          renderTable={(currentItems, startIndex) => (
            <div className="border rounded-md shadow-sm overflow-hidden">
              <Table className="table-fixed">
                <TableHeader className="bg-[#f5f5f5] dark:bg-[#262626]">
                  <TableRow className="bg-muted">
                    <TableHead className="w-[5%] text-center">No.</TableHead>
                    <TableHead className="w-[30%]">Class</TableHead>
                    <TableHead className="w-[20%]">Name</TableHead>
                    <TableHead className="w-[10%] text-center">
                      Accuracy
                    </TableHead>
                    <TableHead className="w-[15%]">Last Active</TableHead>
                    <TableHead className="w-[15%] pl-7">Mode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((student, index) => (
                    <StudentRow
                      key={`${student.userId}-${student.classId}-${index}`}
                      student={student}
                      index={startIndex + index}
                      onClick={handleRowClick}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        />
      </div>

      {selectedStudent && (
        <StudentDashboardCard
          student={selectedStudent}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

interface StudentRowProps {
  student: StudentClassData;
  index: number;
  isLoading?: boolean;
  onClick: (student: StudentClassData) => void;
}

export const StudentRow = ({
  student,
  index,
  isLoading = false,
  onClick,
}: StudentRowProps) => {
  const isUserOnline = isOnline(student.lastActivity);
  const activityTimestamp = formatActivityTimestamp(student.lastActivity);

  // Create progress data from student data
  const progressData: ProgressData = {
    totalAccepted: student.totalAccepted,
    totalRejected: student.totalRejected,
    totalInteractions: student.totalInteractions,
    correctSuggestions: student.correctSuggestions,
    accuracyPercentage: student.accuracyPercentage,
  };

  if (isLoading) {
    return (
      <TableRow>
        <TableCell>
          <div className="h-4 bg-muted rounded animate-pulse"></div>
        </TableCell>
        <TableCell>
          <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
        </TableCell>
        <TableCell>
          <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-muted rounded-full animate-pulse"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-12"></div>
          </div>
        </TableCell>
        <TableCell>
          <div className="h-4 bg-muted rounded animate-pulse"></div>
        </TableCell>
        <TableCell>
          <div className="h-6 bg-muted rounded animate-pulse w-16"></div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow
      onClick={() => onClick(student)}
      className="cursor-pointer bg-white/40 dark:bg-black/40 hover:bg-muted/50 dark:hover:bg-muted/50 transition-colors border-b border-muted"
    >
      <TableCell className="font-medium text-center">{index + 1}</TableCell>

      <TableCell className="font-medium">
        <div className="truncate max-w-[200px]" title={student.classTitle}>
          {student.classTitle}
        </div>
      </TableCell>

      <TableCell>
        <div className="truncate max-w-[150px]" title={student.fullName}>
          {student.fullName}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-3 justify-center">
          <MiniPieChart progressData={progressData} size="sm" />
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2 text-xs">
          <div
            className={`w-2 h-2 rounded-full ${
              isUserOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <span
            className={
              isUserOnline
                ? "text-green-600 font-medium"
                : "text-muted-foreground"
            }
          >
            {activityTimestamp}
          </span>
        </div>
      </TableCell>

      <TableCell className="hidden md:table-cell">
        <ModeBadge mode={student.mode as UserMode} />
      </TableCell>
    </TableRow>
  );
};

export default StudentDataTable;

interface GreenDotProps {
  isOnline?: boolean;
  className?: string;
}

export const GreenDot = ({ className = "", isOnline }: GreenDotProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        {isOnline ? (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <div className="absolute inset-0 w-2 h-2 bg-gray-700 dark:bg-white rounded-full animate-ping opacity-75" />
            <span className="text-xs text-green-600 font-medium">Online</span>
          </>
        ) : (
          <div className="w-2 h-2 bg-gray-400 rounded-full" />
        )}
      </div>
    </div>
  );
};
