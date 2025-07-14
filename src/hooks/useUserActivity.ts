import { getUserActivity } from "../api/user";
import { calculateProgress } from "../utils/calculateProgress";
import { getEventsForMode } from "../api/types/event";
import { ProgressData, UserActivityLogItem } from "../api/types/suggestion";
import { ActiveUserMode } from "../api/types/user";
import { useQuery } from "@tanstack/react-query";
import QUERY_INTERVALS from "@/constants/queryIntervals";
import { useMemo } from "react";

export const useUserActivity = (
  userId?: string | null,
  mode?: ActiveUserMode | null,
  selectedClassId: string | null = null
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["userActivity", userId, mode],
    queryFn: async () => {
      if (!userId || !mode) {
        return [];
      }

      const { logs, error } = await getUserActivity(
        userId,
        mode as ActiveUserMode
      );
      if (error || !logs) throw new Error(error);

      const events = getEventsForMode(mode as ActiveUserMode);
      const logArray = logs as UserActivityLogItem[];

      const filteredActivities = logArray.filter(
        (activity) =>
          activity.event === events?.accept || activity.event === events?.reject
      );

      return filteredActivities;
    },
    enabled: !!userId && !!mode,
    staleTime: QUERY_INTERVALS.staleTime,
    gcTime: QUERY_INTERVALS.gcTime,
    retry: QUERY_INTERVALS.retry,
    retryDelay: 500,
    refetchOnWindowFocus: false,
  });

  const filteredUserActivity = useMemo(() => {
    if (!data || !data.length) return [];

    let filtered = [...data];

    if (selectedClassId === "non-class") {
      filtered = filtered.filter((activity) => !activity.classId);
    } else if (selectedClassId && selectedClassId !== "all") {
      filtered = filtered.filter(
        (activity) => activity.classId === selectedClassId
      );
    }

    return filtered;
  }, [data, selectedClassId]);

  const progressData = useMemo(() => {
    if (!filteredUserActivity.length || !mode) {
      return getEmptyProgressData();
    }

    return calculateProgress(filteredUserActivity, mode as ActiveUserMode);
  }, [filteredUserActivity, mode]);

  return {
    userActivity: filteredUserActivity,
    progressData,
    loading: isLoading,
    error: error?.message || null,
    refetch,
    isEmpty: !isLoading && filteredUserActivity.length === 0,
  };
};

const getEmptyProgressData = (): ProgressData => ({
  totalAccepted: 0,
  totalRejected: 0,
  totalInteractions: 0,
  correctSuggestions: 0,
  accuracyPercentage: 0,
});
