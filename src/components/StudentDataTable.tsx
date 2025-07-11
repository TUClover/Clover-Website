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

interface StudentClassData {
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

        <table className="w-full text-sm text-left text-text">
          <thead>
            <tr className="border-b border-gray-900 dark:border-gray-100 font-semibold">
              <th className="p-2 font-bold w-4">No.</th>
              <th className="p-2">Class</th>
              <th className="p-2">Name</th>
              <th className="p-2">Accuracy</th>
              <th className="p-2 w-32">Status</th>
              <th className="p-2 w-24">Mode</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-400 dark:divide-gray-100">
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
          </tbody>
        </table>
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

        <p className="text-sm text-gray-500 dark:text-gray-400">
          {filteredStudents.length}{" "}
          {filteredStudents.length === 1 ? "student" : "students"} found
        </p>
      </div>

      <PaginatedTable
        data={filteredStudents}
        renderTable={(currentItems, startIndex) => (
          <table className="w-full text-sm text-left text-text">
            <thead>
              <tr className="border-b border-gray-900 dark:border-gray-100 font-semibold">
                <th className="p-2 w-4">No.</th>
                <th className="p-2">Class</th>
                <th className="p-2">Name</th>
                <th className="p-2">Accuracy</th>
                <th className="p-2 w-32">Status</th>
                <th className="p-2 w-24">Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-400 dark:divide-gray-100">
              {currentItems.map((student, index) => (
                <StudentRow
                  key={`${student.userId}-${student.classId}-${index}`}
                  student={student}
                  index={startIndex + index}
                  onClick={handleRowClick}
                />
              ))}
            </tbody>
          </table>
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
        className="border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-0"
        value={nameFilter}
        onChange={(e) => setNameFilter(e.target.value)}
      />

      <Select value={classFilter} onValueChange={setClassFilter}>
        <SelectTrigger className="border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-0">
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
        <SelectTrigger className="border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-0">
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
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {timePart}
        </span>
      </div>
    );
  };

  const getOfflineStatus = () => (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
      {formatTimestamp(student.lastActivity)}
    </div>
  );

  const getModeDisplay = (mode: ActiveUserMode) => {
    switch (mode) {
      case "LINE_BY_LINE":
        return (
          <Badge className="text-xs bg-blue-700 px-2 py-1 rounded">Line</Badge>
        );
      case "CODE_BLOCK":
        return (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
            Block
          </span>
        );
      case "CODE_SELECTION":
        return (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
            Selection
          </span>
        );
      default:
        return (
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            Unknown
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <tr>
        <td className="p-2 w-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </td>
        <td className="p-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
        </td>
        <td className="p-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
        </td>
        <td className="p-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-8"></div>
          </div>
        </td>
        <td className="p-2 w-32">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </td>
        <td className="p-2 w-24">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </td>
      </tr>
    );
  }

  return (
    <tr
      onClick={() => onClick(student)}
      className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
    >
      <td className="p-2">{index + 1}</td>
      <td className="p-2">{student.classTitle}</td>
      <td className="p-2">{student.fullName}</td>
      <td className="p-2">
        <div className="flex flex-col items-center sm:flex-row sm:items-center gap-1">
          <MiniPieChart
            correct={student.correctSuggestions}
            incorrect={student.totalAccepted - student.correctSuggestions}
          />
          <span className="text-xs text-gray-500">
            ({student.correctSuggestions}/{student.totalAccepted})
          </span>
        </div>
      </td>
      <td className="p-2 w-32">
        {isOnline() ? <GreenDot /> : getOfflineStatus()}
      </td>
      <td className="p-2 w-24">{getModeDisplay(student.mode)}</td>
    </tr>
  );
};

export default StudentDataTable;

interface GreenDotProps {
  className?: string;
}

export const GreenDot = ({ className = "" }: GreenDotProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <div className="absolute inset-0 w-2 h-2 bg-gray-700 dark:bg-white rounded-full animate-ping opacity-75"></div>
      </div>
      <span className="text-xs text-green-600 font-medium">Online</span>
    </div>
  );
};
