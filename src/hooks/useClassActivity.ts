import { useEffect, useState } from "react";
import { ActiveUserMode } from "../api/types/user";
import { ProgressData } from "../api/types/suggestion";
import { getEventsForMode } from "../api/types/event";
import {
  getClassActivityByInstructorId,
  InstructorLogResponse,
} from "../api/classes";

/**
 * Custom hook to fetch and manage class activity logs.
 * It fetches all activity logs for the provided classes and filters them based on the selected class ID.
 * @param classes - Array of UserClass objects representing the classes to fetch activity for.
 * @param selectedClassId - The ID of the selected class to filter activity logs by.
 * @returns An object containing the following properties:
 */
export const useClassActivity = (
  instructorId: string,
  selectedClassId: string | null,
  mode?: ActiveUserMode | null
) => {
  const [allActivity, setAllActivity] = useState<InstructorLogResponse[]>([]);
  const [classActivity, setClassActivity] = useState<InstructorLogResponse[]>(
    []
  );
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
    if (!instructorId) {
      setLoading(false);
      return;
    }

    const fetchInstructorActivity = async () => {
      try {
        setError(null);
        setLoading(true);

        const { data, error } =
          await getClassActivityByInstructorId(instructorId);

        if (error) {
          throw new Error(error);
        }

        const activityData = data || [];
        console.log("Fetched instructor activity:", data.length);

        setAllActivity(activityData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorActivity();
  }, [instructorId]);

  useEffect(() => {
    if (!mode) return;

    const activeMode = mode as ActiveUserMode;
    const events = getEventsForMode(activeMode);

    const filteredByMode = allActivity.filter(
      (log) => log.event === events?.accept || log.event === events?.reject
    );

    // Then filter by selected class
    let filteredByClass: InstructorLogResponse[];
    if (selectedClassId && selectedClassId !== "all") {
      // Filter to specific class
      filteredByClass = filteredByMode.filter(
        (log) => log.classId === selectedClassId
      );
    } else {
      // Show all classes
      filteredByClass = filteredByMode;
    }

    setClassActivity(filteredByClass);

    const progress = calculateProgressFromInstructorLogs(
      filteredByClass,
      activeMode
    );
    setProgressData(progress);
  }, [allActivity, selectedClassId, mode]);

  return {
    allActivity,
    classActivity,
    progressData,
    loading,
    error,
    isEmpty: !loading && classActivity.length === 0,
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
