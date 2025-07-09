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

/**
 * Custom hook to fetch user activity logs and calculate progress data.
 * @param {string | null} userId - The ID of the user whose activity is to be fetched.
 * @param {string | null} selectedClassId - The ID of the selected class (optional).
 * @param {"all" | "class" | "non-class" | null} selectedClassType - The type of class filter (optional).
 * @returns {Object} - An object containing user activity logs, progress data, loading state, error message, and empty state.
 */
// export const useUserActivity = (
//   userId?: string | null,
//   mode?: ActiveUserMode | null,
//   selectedClassId: string | null = null,
//   selectedClassType: "all" | "class" | "non-class" | null = "all"
// ) => {
//   const [userActivity, setUserActivity] = useState<UserActivityLogItem[]>([]);
//   const [progressData, setProgressData] = useState<ProgressData>({
//     totalAccepted: 0,
//     totalRejected: 0,
//     totalInteractions: 0,
//     correctSuggestions: 0,
//     accuracyPercentage: 0,
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!userId || !mode) {
//       setLoading(false);
//       return;
//     }

//     const fetchActivity = async () => {
//       const activeMode = mode as ActiveUserMode;

//       try {
//         setError(null);
//         const { logs, error } = await getUserActivity(userId, activeMode);
//         if (error || !logs) throw new Error(error);

//         const events = getEventsForMode(activeMode);

//         const logArray = logs as UserActivityLogItem[];
//         let filteredActivities = logArray.filter(
//           (activity) =>
//             activity.event === events?.accept ||
//             activity.event === events?.reject
//         );

//         if (!filteredActivities.length) {
//           setUserActivity([]);
//           setLoading(false);
//           return;
//         }

//         if (selectedClassType === "non-class") {
//           filteredActivities = filteredActivities.filter(
//             (activity) => !activity.classId
//           );
//         } else if (selectedClassType === "class" && selectedClassId) {
//           filteredActivities = filteredActivities.filter(
//             (activity) => activity.classId === selectedClassId
//           );
//         }

//         setUserActivity(filteredActivities);

//         const progress = calculateProgress(filteredActivities, activeMode);
//         setProgressData(progress);
//       } catch (err) {
//         console.error("Error fetching user activity:", err);
//         setError(err instanceof Error ? err.message : "Unknown error");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchActivity();
//   }, [userId, mode, selectedClassId, selectedClassType]);

//   return {
//     userActivity,
//     progressData,
//     loading,
//     error,
//     isEmpty: !loading && userActivity.length === 0,
//   };
// };
