import { useEffect, useState } from "react";
import { getUserActivity } from "../api/user";
import { calculateProgress } from "../utils/calculateProgress";
import { getEventsForMode } from "../api/types/event";
import { ProgressData, UserActivityLogItem } from "../api/types/suggestion";
import { ActiveUserMode } from "../api/types/user";

/**
 * Custom hook to fetch user activity logs and calculate progress data.
 * @param {string | null} userId - The ID of the user whose activity is to be fetched.
 * @param {string | null} selectedClassId - The ID of the selected class (optional).
 * @param {"all" | "class" | "non-class" | null} selectedClassType - The type of class filter (optional).
 * @returns {Object} - An object containing user activity logs, progress data, loading state, error message, and empty state.
 */
export const useUserActivity = (
  userId?: string | null,
  mode?: ActiveUserMode | null,
  selectedClassId: string | null = null,
  selectedClassType: "all" | "class" | "non-class" | null = "all"
) => {
  const [userActivity, setUserActivity] = useState<UserActivityLogItem[]>([]);
  const [progressData, setProgressData] = useState<ProgressData>({
    totalAccepted: 0,
    totalRejected: 0,
    totalInteractions: 0,
    correctSuggestions: 0,
    accuracyPercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !mode) {
      setLoading(false);
      return;
    }

    const fetchActivity = async () => {
      // At this point we know mode is not null due to the check above
      const activeMode = mode as ActiveUserMode;

      try {
        setError(null);
        const { logs, error } = await getUserActivity(userId, activeMode);
        if (error || !logs) throw new Error(error);

        const events = getEventsForMode(activeMode);

        const logArray = logs as UserActivityLogItem[];
        let filteredActivities = logArray.filter(
          (activity) =>
            activity.event === events?.accept ||
            activity.event === events?.reject
        );

        if (!filteredActivities.length) {
          setUserActivity([]);
          setLoading(false);
          return;
        }

        if (selectedClassType === "non-class") {
          filteredActivities = filteredActivities.filter(
            (activity) => !activity.classId
          );
        } else if (selectedClassType === "class" && selectedClassId) {
          filteredActivities = filteredActivities.filter(
            (activity) => activity.classId === selectedClassId
          );
        }

        setUserActivity(filteredActivities);

        const progress = calculateProgress(filteredActivities, activeMode);
        setProgressData(progress);
      } catch (err) {
        console.error("Error fetching user activity:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [userId, mode, selectedClassId, selectedClassType]);

  return {
    userActivity,
    progressData,
    loading,
    error,
    isEmpty: !loading && userActivity.length === 0,
  };
};
// export const useUserActivity = (
//   userId?: string | null,
//   selectedClassId: string | null = null,
//   selectedClassType: "all" | "class" | "non-class" | null = "all"
// ) => {
//   const [userActivity, setUserActivity] = useState<UserActivityLogItem[]>([]);
//   const [progressData, setProgressData] = useState<ProgressData>({
//     totalAccepted: 0,
//     correctSuggestions: 0,
//     percentageCorrect: 0,
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!userId) {
//       setLoading(false);
//       return;
//     }

//     const fetchActivity = async () => {
//       try {
//         setError(null);
//         const { data, error } = await getUserActivity(userId);
//         if (error || !data) throw new Error(error);

//         let filteredActivities = data.filter(
//           (activity) =>
//             activity.event === LogEvent.SUGGESTION_ACCEPT ||
//             activity.event === LogEvent.USER_REJECT
//         );
//         if (!filteredActivities) {
//           setUserActivity([]);
//           setLoading(false);
//           return;
//         }

//         if (selectedClassType === "non-class") {
//           filteredActivities = filteredActivities.filter(
//             (activity) => !activity.class_id
//           );
//         } else if (selectedClassType === "class" && selectedClassId) {
//           filteredActivities = filteredActivities.filter(
//             (activity) => activity.class_id === selectedClassId
//           );
//         }

//         setUserActivity(filteredActivities);

//         const progress = calculateProgress(filteredActivities);
//         setProgressData(progress);
//       } catch (err) {
//         console.error("Error fetching user activity:", err);
//         setError(err instanceof Error ? err.message : "Unknown error");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchActivity();
//   }, [userId, selectedClassId, selectedClassType]);

//   return {
//     userActivity,
//     progressData,
//     loading,
//     error,
//     isEmpty: !loading && userActivity.length === 0,
//   };
// };
