import { ActiveUserMode } from "../api/types/user";
import { ProgressData } from "../api/types/suggestion";
import { getEventsForMode } from "../api/types/event";
import {
  getClassActivityByInstructorId,
  InstructorLogResponse,
} from "../api/classes";
import { useQuery } from "@tanstack/react-query";
import QUERY_INTERVALS from "@/constants/queryIntervals";
import { useMemo } from "react";

/**
 * Custom hook to fetch and manage class activity logs.
 * It fetches all activity logs for the provided classes and filters them based on the selected class ID.
 * @param classes - Array of UserClass objects representing the classes to fetch activity for.
 * @param selectedClassId - The ID of the selected class to filter activity logs by.
 * @returns An object containing the following properties:
 */

export const useClassActivity = (
  instructorId?: string | null,
  selectedClassId: string | null = null,
  mode?: ActiveUserMode | null
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["classActivity", instructorId],
    queryFn: async () => {
      if (!instructorId) {
        return [];
      }

      const { data, error } =
        await getClassActivityByInstructorId(instructorId);
      if (error || !data) throw new Error(error);

      return data as InstructorLogResponse[];
    },
    enabled: !!instructorId,
    staleTime: QUERY_INTERVALS.staleTime,
    gcTime: QUERY_INTERVALS.gcTime,
    retry: QUERY_INTERVALS.retry,
    retryDelay: 500,
    refetchOnWindowFocus: false,
  });

  const filteredClassActivity = useMemo(() => {
    if (!data || !data.length) return [];

    let filtered = [...data];

    if (mode) {
      const events = getEventsForMode(mode as ActiveUserMode);
      filtered = filtered.filter(
        (log) => log.event === events?.accept || log.event === events?.reject
      );
    }

    if (selectedClassId === "non-class") {
      filtered = filtered.filter((activity) => !activity.classId);
    } else if (selectedClassId && selectedClassId !== "all") {
      filtered = filtered.filter(
        (activity) => activity.classId === selectedClassId
      );
    }

    return filtered;
  }, [data, selectedClassId, mode]);

  const progressData = useMemo(() => {
    if (!filteredClassActivity.length || !mode) {
      return getEmptyProgressData();
    }

    return calculateProgressFromInstructorLogs(
      filteredClassActivity,
      mode as ActiveUserMode
    );
  }, [filteredClassActivity, mode]);

  return {
    allActivity: data || [],
    classActivity: filteredClassActivity,
    progressData,
    loading: isLoading,
    error: error?.message || null,
    refetch,
    isEmpty: !isLoading && filteredClassActivity.length === 0,
  };
};

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

const getEmptyProgressData = (): ProgressData => ({
  totalAccepted: 0,
  totalRejected: 0,
  totalInteractions: 0,
  correctSuggestions: 0,
  accuracyPercentage: 0,
});
