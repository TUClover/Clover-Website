import { useMemo, useState } from "react";
import MiniPieChart from "./MiniPieChart";
import { ActiveUserMode, StudentStatus } from "../api/types/user";
import PaginatedTable from "./PaginatedTable";
import { Input } from "./ui/input";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "./ui/select";
import StudentDashboardCard from "./StudentDashboardCard";
import { UserActivityLogItem } from "../api/types/suggestion";
import { useStudentData } from "@/hooks/useUserData";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export interface StudentClassData {
  userId: string;
  fullName?: string;
  classId?: string;
  classTitle: string;
  studentStatus?: StudentStatus;
  totalAccepted: number;
  correctSuggestions: number;
  percentageCorrect: number;
  lastActivity: string;
  mode: ActiveUserMode; // Always specific mode, never mixed
  logs?: UserActivityLogItem[];
}

interface StudentDataTableProps {
  instructorId: string;
}

export const StudentDataTable = ({ instructorId }: StudentDataTableProps) => {
  const [selectedStudent, setSelectedStudent] =
    useState<StudentClassData | null>(null);
  const [nameFilter, setNameFilter] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<ActiveUserMode | "all">("all");

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
        <StudentFilters
          nameFilter={nameFilter}
          setNameFilter={setNameFilter}
          modeFilter={modeFilter}
          setModeFilter={setModeFilter}
          classFilter={classFilter}
          setClassFilter={setClassFilter}
          classOptions={[]}
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[5%]">No.</TableHead>
              <TableHead className="w-[30%]">Class</TableHead>
              <TableHead className="w-[20%]">Name</TableHead>
              <TableHead className="w-[15%]">Accuracy</TableHead>
              <TableHead className="w-[20%]">Status</TableHead>
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
                  correctSuggestions: 0,
                  percentageCorrect: 0,
                  lastActivity: new Date().toISOString(),
                  mode: "LINE_BY_LINE",
                }}
                index={index}
                isLoading={true}
                onClick={() => {}}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 my-4">
        <StudentFilters
          nameFilter={nameFilter}
          setNameFilter={setNameFilter}
          modeFilter={modeFilter}
          setModeFilter={setModeFilter}
          classFilter={classFilter}
          setClassFilter={setClassFilter}
          classOptions={classOptions}
        />

        {/* <p className="text-sm text-muted-foreground">
          {filteredStudents.length}{" "}
          {filteredStudents.length === 1 ? "student" : "students"} found
        </p> */}
      </div>

      <PaginatedTable
        data={filteredStudents}
        renderTable={(currentItems, startIndex) => (
          <div className="border rounded-md shadow-sm overflow-hidden">
            <Table className="table-fixed">
              <TableHeader className="bg-[#f5f5f5] dark:bg-[#262626]">
                <TableRow className="bg-muted">
                  <TableHead className="w-[5%]">No.</TableHead>
                  <TableHead className="w-[30%]">Class</TableHead>
                  <TableHead className="w-[20%]">Name</TableHead>
                  <TableHead className="w-[15%]">Accuracy</TableHead>
                  <TableHead className="w-[20%]">Status</TableHead>
                  <TableHead className="w-[10%] hidden sm:block">
                    Mode
                  </TableHead>
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
      {selectedStudent && (
        <StudentDashboardCard
          student={selectedStudent}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

// Updated StudentFilters component
interface StudentFiltersProps {
  nameFilter: string;
  setNameFilter: (value: string) => void;
  modeFilter: ActiveUserMode | "all";
  setModeFilter: (value: ActiveUserMode | "all") => void;
  classFilter: string;
  setClassFilter: (value: string) => void;
  classOptions: Array<{ id: string; title: string }>;
}

export function StudentFilters({
  nameFilter,
  setNameFilter,
  modeFilter,
  setModeFilter,
  classFilter,
  setClassFilter,
  classOptions,
}: StudentFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Input
        type="text"
        placeholder="Filter by name"
        value={nameFilter}
        onChange={(e) => setNameFilter(e.target.value)}
      />

      <Select value={classFilter} onValueChange={setClassFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Select class" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Classes</SelectItem>
          {classOptions.map((classOption) => (
            <SelectItem key={classOption.id} value={classOption.id}>
              {classOption.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(modeFilter)}
        onValueChange={(value) =>
          setModeFilter(value as ActiveUserMode | "all")
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Select mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Modes</SelectItem>
          <SelectItem value="LINE_BY_LINE">Line by Line</SelectItem>
          <SelectItem value="CODE_BLOCK">Code Block</SelectItem>
          <SelectItem value="CODE_SELECTION">Code Selection</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export const StudentRow = ({
  student,
  index,
  isLoading = false,
  onClick,
}: {
  student: StudentClassData;
  index: number;
  isLoading?: boolean;
  onClick: (student: StudentClassData) => void;
}) => {
  const isOnline = () => {
    const now = new Date();
    const lastActivity = new Date(student.lastActivity);
    const diffInMinutes =
      (now.getTime() - lastActivity.getTime()) / (1000 * 60);
    return diffInMinutes <= 5;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const datePart = date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timePart = date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return (
      <div className="flex flex-col gap-1">
        <span className="text-sm">{datePart}</span>
        <span className="text-xs text-muted-foreground">{timePart}</span>
      </div>
    );
  };

  const getModeDisplay = (mode: ActiveUserMode) => {
    switch (mode) {
      case "LINE_BY_LINE":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-900 text-blue-200 w-20 rounded-xl justify-center py-1"
          >
            Line
          </Badge>
        );
      case "CODE_BLOCK":
        return (
          <Badge
            variant="secondary"
            className="bg-green-900 text-green-200 w-20 rounded-xl justify-center py-1"
          >
            Block
          </Badge>
        );
      case "CODE_SELECTION":
        return (
          <Badge
            variant="secondary"
            className="bg-purple-900 text-purple-200 w-20 rounded-xl justify-center py-1"
          >
            Selection
          </Badge>
        );
    }
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
            <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-8"></div>
          </div>
        </TableCell>
        <TableCell>
          <div className="h-4 bg-muted rounded animate-pulse"></div>
        </TableCell>
        <TableCell>
          <div className="h-4 bg-muted rounded animate-pulse"></div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow
      onClick={() => onClick(student)}
      className="cursor-pointer hover:bg-muted/50 transition-colors"
    >
      <TableCell>{index + 1}</TableCell>
      <TableCell>{student.classTitle}</TableCell>
      <TableCell>{student.fullName}</TableCell>
      <TableCell>
        <div className="flex flex-col items-center sm:flex-row sm:items-center gap-1">
          <MiniPieChart
            correct={student.correctSuggestions}
            incorrect={student.totalAccepted - student.correctSuggestions}
          />
          <span className="text-xs text-muted-foreground">
            ({student.correctSuggestions}/{student.totalAccepted})
          </span>
        </div>
      </TableCell>
      <TableCell>
        {isOnline() ? (
          <GreenDot isOnline />
        ) : (
          <div className="flex items-center gap-3">
            <GreenDot /> <span>{formatTimestamp(student.lastActivity)}</span>
          </div>
        )}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {getModeDisplay(student.mode)}
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
