import { ActiveUserMode } from "@/api/types/user";
import { useClassActivity } from "./useClassActivity";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getClassesByInstructor, InstructorLogResponse } from "@/api/classes";
import { getEventsForMode } from "@/api/types/event";

interface StudentClassData {
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
  mode: ActiveUserMode;
  logs?: InstructorLogResponse[];
}

interface UseStudentDataOptions {
  instructorId: string;
  classFilter?: string;
  modeFilter?: ActiveUserMode | "all";
}

export const useStudentData = ({
  instructorId,
  classFilter = "all",
  modeFilter = "all",
}: UseStudentDataOptions) => {
  // Get all activity data
  const { allActivity, loading: activityLoading } = useClassActivity(
    instructorId,
    null,
    null
  );

  // Get instructor classes WITH students data
  const {
    data: instructorClasses = [],
    isLoading: classesLoading,
    error: classesError,
  } = useQuery({
    queryKey: ["instructorClassesWithStudents", instructorId],
    queryFn: async () => {
      if (!instructorId) return [];
      // Fetch classes with students included
      const { data, error } = await getClassesByInstructor(instructorId, true);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: !!instructorId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    retry: 2,
  });

  // Create user data map from students in classes
  const userDataMap = useMemo(() => {
    const map = new Map();

    instructorClasses.forEach((cls) => {
      if (cls.students) {
        cls.students.forEach((student) => {
          map.set(student.id, {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            fullName:
              `${student.firstName || ""} ${student.lastName || ""}`.trim(),
          });
        });
      }
    });

    return map;
  }, [instructorClasses]);

  // Get class options
  const classOptions = useMemo(() => {
    const classMap = new Map();

    // Add instructor classes
    instructorClasses.forEach((cls) => {
      classMap.set(cls.id, {
        id: cls.id,
        title: cls.classTitle || "Unknown Class",
      });
    });

    // Add classes from activity if not already present
    allActivity
      .filter((log) => log.classId && log.classTitle)
      .forEach((log) => {
        if (!classMap.has(log.classId)) {
          classMap.set(log.classId, { id: log.classId, title: log.classTitle });
        }
      });

    return Array.from(classMap.values());
  }, [instructorClasses, allActivity]);

  // Process student data
  const studentData = useMemo(() => {
    if (!allActivity.length || classesLoading) {
      return [];
    }

    // Group logs by user + class + mode
    const userClassModeMap = new Map<string, InstructorLogResponse[]>();

    for (const log of allActivity) {
      if (!log.userId) continue;

      // Determine mode from log
      const logMode = determineLogMode(log);
      if (!logMode) continue;

      // Apply filters
      if (modeFilter !== "all" && logMode !== modeFilter) continue;
      if (classFilter !== "all" && log.classId !== classFilter) continue;

      const key = `${log.userId}|${log.classId || "no-class"}|${logMode}`;

      if (!userClassModeMap.has(key)) {
        userClassModeMap.set(key, []);
      }
      userClassModeMap.get(key)!.push(log);
    }

    // Process each user-class-mode combination
    const students: StudentClassData[] = Array.from(
      userClassModeMap.entries()
    ).map(([key, userLogs]) => {
      const [userId, classId, mode] = key.split("|");

      // Calculate progress using the same logic as useClassActivity
      const progressData = calculateProgressFromInstructorLogs(
        userLogs,
        mode as ActiveUserMode
      );

      // Get last activity
      const lastActivity = userLogs.reduce(
        (latest, log) =>
          new Date(log.createdAt) > new Date(latest) ? log.createdAt : latest,
        userLogs[0].createdAt
      );

      // Get class title
      const classTitle =
        instructorClasses.find((cls) => cls.id === classId)?.classTitle ||
        allActivity.find((log) => log.classId === classId)?.classTitle ||
        "Unknown Class";

      // Get user data from the classes with students
      const userData = userDataMap.get(userId);

      return {
        userId,
        classId,
        classTitle,
        fullName: userData?.fullName || "Unknown User",
        totalAccepted: progressData.totalAccepted,
        totalRejected: progressData.totalRejected,
        totalInteractions: progressData.totalInteractions,
        correctSuggestions: progressData.correctSuggestions,
        accuracyPercentage: Math.round(progressData.accuracyPercentage),
        lastActivity,
        mode: mode as ActiveUserMode,
        logs: userLogs,
      };
    });

    return students;
  }, [
    allActivity,
    userDataMap,
    classFilter,
    modeFilter,
    classesLoading,
    instructorClasses,
  ]);

  const isLoading = activityLoading || classesLoading;

  const error = classesError?.message || null;

  return {
    students: studentData,
    classOptions,
    isLoading,
    error,
    refetch: () => {
      // No individual user queries to refetch since we get everything from classes
    },
  };
};

// Helper function to determine mode from log
function determineLogMode(log: InstructorLogResponse): ActiveUserMode | null {
  // Check event names first
  if (log.event.includes("LINE")) return "LINE_BY_LINE";
  if (log.event.includes("BLOCK")) return "CODE_BLOCK";
  if (log.event.includes("SELECTION")) return "CODE_SELECTION";

  // Check suggestion IDs
  if (log.lineSuggestionId) return "LINE_BY_LINE";
  if (log.suggestionId) return "CODE_BLOCK";
  if (log.selectionSuggestionItemId) return "CODE_SELECTION";

  return null;
}

// Use the exact same progress calculation as useClassActivity
function calculateProgressFromInstructorLogs(
  logs: InstructorLogResponse[],
  mode: ActiveUserMode
): ProgressData {
  const events = getEventsForMode(mode);

  const acceptedLogs = logs.filter((log) => log.event === events?.accept);
  const rejectedLogs = logs.filter((log) => log.event === events?.reject);

  const totalAccepted = acceptedLogs.length;
  const totalRejected = rejectedLogs.length;
  const totalInteractions = totalAccepted + totalRejected;

  const correctSuggestions = acceptedLogs.filter((log) => !log.hasBug).length;

  const accuracyPercentage =
    totalAccepted > 0 ? (correctSuggestions / totalAccepted) * 100 : 0;

  return {
    totalAccepted,
    totalRejected,
    totalInteractions,
    correctSuggestions,
    accuracyPercentage,
  };
}

// Use the same ProgressData interface as useClassActivity
interface ProgressData {
  totalAccepted: number;
  totalRejected: number;
  totalInteractions: number;
  correctSuggestions: number;
  accuracyPercentage: number;
}
