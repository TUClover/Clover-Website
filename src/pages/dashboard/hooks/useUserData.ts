import { UserMode } from "@/types/user";
import { useClassActivity } from "./useClassActivity";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getClassesByInstructor } from "@/api/classes";
import { ActivityLogResponse, UserActivityLogItem } from "@/types/suggestion";
import { calculateProgress } from "@/utils/calculateProgress";
import { StudentClassData } from "@/types/class";

interface UseStudentDataOptions {
  instructorId: string;
  classFilter?: string;
  modeFilter?: UserMode | "all";
}

export const useStudentData = ({
  instructorId,
  classFilter = "all",
  modeFilter = "all",
}: UseStudentDataOptions) => {
  const { allActivity, loading: activityLoading } = useClassActivity(
    instructorId,
    null,
    null
  );

  const {
    data: instructorClasses = [],
    isLoading: classesLoading,
    error: classesError,
  } = useQuery({
    queryKey: ["instructorClassesWithStudents", instructorId],
    queryFn: async () => {
      if (!instructorId) return [];
      const { data, error } = await getClassesByInstructor(instructorId, true);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: !!instructorId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    retry: 2,
  });

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

  const classOptions = useMemo(() => {
    const classMap = new Map();

    instructorClasses.forEach((cls) => {
      classMap.set(cls.id, {
        id: cls.id,
        title: cls.classTitle || "Unknown Class",
      });
    });

    allActivity
      .filter((log) => log.classId && log.classTitle)
      .forEach((log) => {
        if (!classMap.has(log.classId)) {
          classMap.set(log.classId, { id: log.classId, title: log.classTitle });
        }
      });

    return Array.from(classMap.values());
  }, [instructorClasses, allActivity]);

  const studentData = useMemo(() => {
    if (!allActivity.length || classesLoading) {
      return [];
    }

    const userClassModeMap = new Map<string, ActivityLogResponse>();

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
      const progressData = calculateProgress(userLogs);

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
        mode: mode as UserMode,
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

function determineLogMode(log: UserActivityLogItem): UserMode | null {
  // Check event names first
  if (log.event.includes("LINE")) return UserMode.LINE_BY_LINE;
  if (log.event.includes("BLOCK")) return UserMode.CODE_BLOCK;
  if (log.event.includes("SELECTION")) return UserMode.CODE_SELECTION;

  // Check suggestion IDs using 'in' operator for union types
  if ("lineSuggestionId" in log) return UserMode.LINE_BY_LINE;
  if ("suggestionId" in log) return UserMode.CODE_BLOCK;
  if ("selectionSuggestionItemId" in log) return UserMode.CODE_SELECTION;

  return null;
}
