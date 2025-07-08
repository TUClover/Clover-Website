import { getEventsForMode } from "../api/types/event";
import { ProgressData, UserActivityLogItem } from "../api/types/suggestion";
import { ActiveUserMode } from "../api/types/user";

/**
 * Calculate the progress of a user based on their activity logs.
 * @param {UserActivityLogItem[]} logs - The activity logs of the user.
 * @returns {ProgressData} The progress data of the user.
 */
export const calculateProgress = (
  logs: UserActivityLogItem[],
  mode: ActiveUserMode
): ProgressData => {
  const events = getEventsForMode(mode);
  const acceptedLogs = logs.filter((log) => log.event === events?.accept);
  const rejectedLogs = logs.filter((log) => log.event === events?.reject);

  const totalAccepted = acceptedLogs.length;
  const totalRejected = rejectedLogs.length;
  const totalInteractions = totalAccepted + totalRejected;

  const correctSuggestions = acceptedLogs.filter((log) => {
    if ("hasBug" in log) {
      return log.hasBug === false;
    }
    return true;
  }).length;

  const accuracyPercentage =
    totalAccepted > 0 ? (correctSuggestions / totalAccepted) * 100 : 0;

  return {
    totalAccepted,
    totalRejected,
    totalInteractions,
    correctSuggestions,
    accuracyPercentage,
  };
};

// export const calculateProgress = (
//   logs: UserActivityLogItem[]
// ): ProgressData => {
//   const acceptedLogs = logs.filter(
//     (log) => log.event === LogEvent.SUGGESTION_ACCEPT
//   );
//   const totalAccepted = acceptedLogs.length;
//   const correctSuggestions = acceptedLogs.filter(
//     (log) => log.has_bug === false
//   ).length;

//   const percentageCorrect =
//     totalAccepted > 0 ? (correctSuggestions / totalAccepted) * 100 : 0;

//   return {
//     totalAccepted,
//     correctSuggestions,
//     percentageCorrect,
//   };
// };
