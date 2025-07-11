import {
  BlockSuggestionLogResponse,
  LineSuggestionLogResponse,
  SelectionSuggestionLogResponse,
  UserActivityLogItem,
} from "@/api/types/suggestion";
import { ActiveUserMode } from "@/api/types/user";
import { useClassActivity } from "./useClassActivity";
import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { supabase } from "@/supabaseClient";
import { calculateProgress } from "@/utils/calculateProgress";
import { getClassesByInstructor } from "@/api/classes";

interface StudentClassData {
  userId: string;
  fullName?: string;
  classId?: string;
  classTitle: string;
  totalAccepted: number;
  correctSuggestions: number;
  percentageCorrect: number;
  lastActivity: string;
  mode: ActiveUserMode; // Always specific mode, never mixed
  logs?: UserActivityLogItem[];
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
  const { allActivity, loading: activityLoading } = useClassActivity(
    instructorId,
    null,
    null
  );

  // Fetch instructor's classes separately to include all classes (even without activity)
  const {
    data: instructorClasses = [],
    isLoading: classesLoading,
    error: classesError,
  } = useQuery({
    queryKey: ["instructorClasses", instructorId],
    queryFn: async () => {
      if (!instructorId) return [];
      const { data, error } = await getClassesByInstructor(instructorId);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: !!instructorId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    retry: 2,
  });

  // Get unique user IDs for batch user data fetching
  const uniqueUserIds = useMemo(() => {
    return Array.from(
      new Set(allActivity.filter((log) => log.userId).map((log) => log.userId))
    );
  }, [allActivity]);

  // Batch fetch user data using useQueries for better performance
  const userQueries = useQueries({
    queries: uniqueUserIds.map((userId) => ({
      queryKey: ["user", userId],
      queryFn: async () => {
        const { data } = await supabase
          .from("users")
          .select("id, first_name, last_name")
          .eq("id", userId)
          .single();

        return data
          ? {
              id: data.id,
              firstName: data.first_name,
              lastName: data.last_name,
              fullName:
                `${data.first_name || ""} ${data.last_name || ""}`.trim(),
            }
          : null;
      },
      staleTime: 1000 * 60 * 10, // 10 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
    })),
  });

  // Create user data map for quick lookup
  const userDataMap = useMemo(() => {
    const map = new Map();
    userQueries.forEach((query, index) => {
      if (query.data) {
        map.set(uniqueUserIds[index], query.data);
      }
    });
    return map;
  }, [userQueries, uniqueUserIds]);

  // Get all classes for filter options (includes classes without activity)
  const classOptions = useMemo(() => {
    // Start with all instructor's classes
    const allClassOptions = instructorClasses.map((cls) => ({
      id: cls.id,
      title: cls.classTitle || "Unknown Class",
    }));

    // Add any classes from activity that might not be in instructor's classes
    const activityClasses = Array.from(
      new Set(
        allActivity
          .filter((log) => log.classId && log.classTitle)
          .map((log) =>
            JSON.stringify({ id: log.classId, title: log.classTitle })
          )
      )
    ).map((str) => JSON.parse(str));

    // Merge and deduplicate
    const classMap = new Map();

    // Add instructor classes first (these are authoritative)
    allClassOptions.forEach((cls) => {
      classMap.set(cls.id, cls);
    });

    // Add activity classes if not already present
    activityClasses.forEach((cls) => {
      if (!classMap.has(cls.id)) {
        classMap.set(cls.id, cls);
      }
    });

    return Array.from(classMap.values());
  }, [instructorClasses, allActivity]);

  const studentData = useMemo(() => {
    if (!allActivity.length || userQueries.some((q) => q.isLoading)) {
      return [];
    }

    console.log("Processing student data...");
    console.log("Total activity logs:", allActivity.length);
    console.log("Sample activity log:", allActivity[0]);

    // Group logs by user + class + mode to create separate rows for each combination
    const userClassModeMap = new Map<string, UserActivityLogItem[]>();

    for (const log of allActivity) {
      if (!log.userId) continue;

      // More flexible mode detection - check event type
      let logMode: ActiveUserMode | null = null;

      // Check for LINE mode events
      if (
        log.event.includes("LINE") ||
        log.event === "LINE_SUGGESTION_ACCEPT" ||
        log.event === "LINE_USER_REJECT"
      ) {
        logMode = "LINE_BY_LINE";
      }
      // Check for BLOCK mode events
      else if (
        log.event.includes("BLOCK") ||
        log.event === "BLOCK_SUGGESTION_ACCEPT" ||
        log.event === "BLOCK_USER_REJECT"
      ) {
        logMode = "CODE_BLOCK";
      }
      // Check for SELECTION mode events
      else if (
        log.event.includes("SELECTION") ||
        log.event === "SELECTION_SUGGESTION_ACCEPT" ||
        log.event === "SELECTION_USER_REJECT"
      ) {
        logMode = "CODE_SELECTION";
      }
      // Fallback for generic events - try to determine from suggestion ID
      else if (
        log.event === "SUGGESTION_ACCEPT" ||
        log.event === "USER_REJECT"
      ) {
        if (log.lineSuggestionId) {
          logMode = "LINE_BY_LINE";
        } else if (log.suggestionId) {
          logMode = "CODE_BLOCK";
        } else if (log.selectionSuggestionItemId) {
          logMode = "CODE_SELECTION";
        }
      }

      console.log(`Log event: ${log.event}, detected mode: ${logMode}`);

      // Skip logs that don't match our mode filter (if specific mode selected)
      if (modeFilter !== "all" && logMode !== modeFilter) {
        continue;
      }

      // Skip logs that don't match our class filter (if specific class selected)
      if (classFilter !== "all" && log.classId !== classFilter) {
        continue;
      }

      // If we still don't have a mode, assign a default based on suggestion type
      if (!logMode) {
        if (log.lineSuggestionId) {
          logMode = "LINE_BY_LINE";
        } else if (log.suggestionId) {
          logMode = "CODE_BLOCK";
        } else if (log.selectionSuggestionItemId) {
          logMode = "CODE_SELECTION";
        } else {
          // Default fallback
          logMode = "LINE_BY_LINE";
        }
      }

      // Create key: userId|classId|mode
      const key = `${log.userId}|${log.classId || "no-class"}|${logMode}`;

      if (!userClassModeMap.has(key)) {
        userClassModeMap.set(key, []);
      }

      // Convert InstructorLogResponse to UserActivityLogItem format
      let userLog: UserActivityLogItem;

      if (log.suggestionId) {
        userLog = {
          id: log.id,
          event: log.event,
          duration: log.duration,
          userId: log.userId,
          classId: log.classId,
          createdAt: log.createdAt,
          hasBug: log.hasBug,
          suggestionId: log.suggestionId,
        } as BlockSuggestionLogResponse;
      } else if (log.lineSuggestionId) {
        userLog = {
          id: log.id,
          event: log.event,
          duration: log.duration,
          userId: log.userId,
          classId: log.classId,
          createdAt: log.createdAt,
          hasBug: log.hasBug,
          lineSuggestionId: log.lineSuggestionId,
        } as LineSuggestionLogResponse;
      } else if (log.selectionSuggestionItemId) {
        userLog = {
          id: log.id,
          event: log.event,
          duration: log.duration,
          userId: log.userId,
          classId: log.classId,
          createdAt: log.createdAt,
          hasBug: log.hasBug,
          selectionSuggestionItemId: log.selectionSuggestionItemId,
        } as SelectionSuggestionLogResponse;
      } else {
        userLog = {
          id: log.id,
          event: log.event,
          duration: log.duration,
          userId: log.userId,
          classId: log.classId,
          createdAt: log.createdAt,
          hasBug: log.hasBug,
          suggestionId: "unknown",
        } as BlockSuggestionLogResponse;
      }

      userClassModeMap.get(key)!.push(userLog);
    }

    console.log("UserClassModeMap size:", userClassModeMap.size);
    console.log("UserClassModeMap keys:", Array.from(userClassModeMap.keys()));

    // Process each user-class-mode combination
    const students: StudentClassData[] = Array.from(
      userClassModeMap.entries()
    ).map(([key, userLogs]) => {
      // Parse key: userId|classId|mode
      const [userId, classId, mode] = key.split("|");

      console.log(`Processing key: ${key}, logs count: ${userLogs.length}`);

      // Calculate progress for this specific mode
      const result = calculateProgress(userLogs, mode as ActiveUserMode);
      const { totalAccepted, correctSuggestions, accuracyPercentage } = result;

      // Get last activity
      const lastActivity = userLogs.reduce(
        (latest, log) =>
          new Date(log.createdAt) > new Date(latest) ? log.createdAt : latest,
        userLogs[0].createdAt
      );

      // Get class title from instructor classes first, then fallback to activity
      const classTitle =
        instructorClasses.find((cls) => cls.id === classId)?.classTitle ||
        allActivity.find((log) => log.classId === classId)?.classTitle ||
        "Unknown Class";

      // Get user data from map
      const userData = userDataMap.get(userId);

      return {
        userId,
        classId,
        classTitle,
        fullName: userData?.fullName || "Unknown User",
        totalAccepted,
        correctSuggestions,
        percentageCorrect: Math.round(accuracyPercentage),
        lastActivity,
        mode: mode as ActiveUserMode,
        logs: userLogs,
      };
    });

    console.log("Final students array:", students.length);
    return students;
  }, [
    allActivity,
    userDataMap,
    classFilter,
    modeFilter,
    userQueries,
    instructorClasses,
  ]);

  // Loading state
  const isLoading =
    activityLoading || classesLoading || userQueries.some((q) => q.isLoading);

  // Error state
  const error =
    classesError?.message ||
    userQueries.find((q) => q.error)?.error?.message ||
    null;

  return {
    students: studentData,
    classOptions,
    isLoading,
    error,
    refetch: () => {
      userQueries.forEach((q) => q.refetch());
    },
  };
};
