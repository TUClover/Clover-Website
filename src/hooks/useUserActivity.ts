import { useEffect, useState } from "react";
import { getUserActivity } from "../api/user";
import { calculateProgress, ProgressData } from "../utils/calculateProgress";
import { LogEvent } from "../api/types/event";
import { UserActivityLogItem } from "../api/types/user";

/**
 * Custom hook to fetch user activity logs and calculate progress data.
 * @param {string | null} userId - The ID of the user whose activity is to be fetched.
 * @param {string | null} selectedClassId - The ID of the selected class (optional).
 * @param {"all" | "class" | "non-class" | null} selectedClassType - The type of class filter (optional).
 * @returns {Object} - An object containing user activity logs, progress data, loading state, error message, and empty state.
 */
export const useUserActivity = (
  userId?: string | null,
  selectedClassId: string | null = null,
  selectedClassType: "all" | "class" | "non-class" | null = "all"
) => {
  const [userActivity, setUserActivity] = useState<UserActivityLogItem[]>([]);
  const [progressData, setProgressData] = useState<ProgressData>({
    totalAccepted: 0,
    correctSuggestions: 0,
    percentageCorrect: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchActivity = async () => {
      try {
        setError(null);
        const response = await getUserActivity(userId);
        if (response.error) throw new Error(response.error);
        console.log(response.data);

        let filteredActivities = response.data?.filter(
          (activity) =>
            activity.event === LogEvent.SUGGESTION_ACCEPT ||
            activity.event === LogEvent.USER_REJECT
        );
        if (!filteredActivities) {
          setUserActivity([]);
          setLoading(false);
          return;
        }

        if (selectedClassType === "non-class") {
          filteredActivities = filteredActivities.filter(
            (activity) => !activity.class_id
          );
        } else if (selectedClassType === "class" && selectedClassId) {
          filteredActivities = filteredActivities.filter(
            (activity) => activity.class_id === selectedClassId
          );
        }

        setUserActivity(filteredActivities);

        const progress = calculateProgress(filteredActivities);
        setProgressData(progress);
      } catch (err) {
        console.error("Error fetching user activity:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [userId, selectedClassId, selectedClassType]);

  return {
    userActivity,
    progressData,
    loading,
    error,
    isEmpty: !loading && userActivity.length === 0,
  };
};
