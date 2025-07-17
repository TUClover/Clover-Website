import { ProgressData } from "@/types/user";
import { ACCEPT_EVENTS, REJECT_EVENTS } from "../types/event";
import { ActivityLogResponse } from "../types/suggestion";

/**
 * Calculate the progress of a user based on their activity logs.
 * @param {UserActivityLogItem[]} logs - The activity logs of the user.
 * @returns {ProgressData} The progress data of the user.
 */
export const calculateProgress = (logs: ActivityLogResponse): ProgressData => {
  const acceptedLogs = logs.filter((log) => ACCEPT_EVENTS.includes(log.event));
  const rejectedLogs = logs.filter((log) => REJECT_EVENTS.includes(log.event));

  const totalAccepted = acceptedLogs.length;
  const totalRejected = rejectedLogs.length;
  const totalInteractions = totalAccepted + totalRejected;

  const correctAccepts = acceptedLogs.filter((log) => !log.hasBug).length;
  const correctRejects = rejectedLogs.filter((log) => log.hasBug).length;

  const correctSuggestions = correctAccepts + correctRejects;

  const accuracyPercentage =
    totalInteractions > 0 ? (correctSuggestions / totalInteractions) * 100 : 0;

  return {
    totalAccepted,
    totalRejected,
    totalInteractions,
    correctSuggestions,
    correctAccepts,
    correctRejects,
    accuracyPercentage,
  };
};

// export const calculateProgressFromInstructorLogs = (
//   logs: ActivityLogResponse
// ): ProgressData => {
//   const acceptedLogs = logs.filter((log) => ACCEPT_EVENTS.includes(log.event));
//   const rejectedLogs = logs.filter((log) => REJECT_EVENTS.includes(log.event));

//   const totalAccepted = acceptedLogs.length;
//   const totalRejected = rejectedLogs.length;
//   const totalInteractions = totalAccepted + totalRejected;

//   const correctSuggestions = acceptedLogs.filter((log) => !log.hasBug).length;

//   const accuracyPercentage =
//     totalAccepted > 0 ? (correctSuggestions / totalAccepted) * 100 : 0;

//   return {
//     totalAccepted,
//     totalRejected,
//     totalInteractions,
//     correctSuggestions,
//     accuracyPercentage,
//   };
// };

export const getEmptyProgressData = (): ProgressData => ({
  totalAccepted: 0,
  totalRejected: 0,
  totalInteractions: 0,
  correctSuggestions: 0,
  correctAccepts: 0,
  correctRejects: 0,
  accuracyPercentage: 0,
});
