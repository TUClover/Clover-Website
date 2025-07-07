import {
  CodeBlockSuggestion,
  CodeSelectionSuggestion,
  getSuggestionIdByMode,
  LineByLineSuggestion,
  SuggestionData,
  UserActivityLogItem,
} from "./types/suggestion";
import { AI_SUGGESTION_ENDPOINT } from "./endpoints";
import { ActiveUserMode } from "./types/user";

/**
 * Fetches a suggestion by its ID.
 * @param {string} suggestionId - The ID of the suggestion to fetch.
 * @returns {Promise<{ data?: CodeSuggestion; error?: string }>} - The response from the server or an error message.
 */
export async function getSuggestionByModeAndId(
  logItem: UserActivityLogItem,
  mode: ActiveUserMode
): Promise<{ data?: SuggestionData; error?: string }> {
  const id = getSuggestionIdByMode(logItem, mode);

  if (!id) {
    return { error: "No suggestion ID found for this mode" };
  }

  try {
    const response = await fetch(`${AI_SUGGESTION_ENDPOINT}/${mode}/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const backendData = await response.json();
    console.log("Backend response:", backendData);

    if (!response.ok) {
      return {
        error:
          backendData.message ||
          `Failed to get suggestion data: ${response.status} ${response.statusText}`,
      };
    }

    const baseTransformed = {
      id: backendData.id,
      createdAt: backendData.created_at,
      prompt: backendData.prompt,
      hasBug: backendData.has_bug,
      duration: logItem.duration,
      model: backendData.model || "",
      vendor: backendData.vendor || "",
      language: backendData.language || "",
      refinedPrompt: backendData.refined_prompt,
    };

    let suggestionData: SuggestionData;

    switch (mode) {
      case "CODE_BLOCK":
        suggestionData = {
          ...baseTransformed,
          suggestionArray: backendData.suggestion_array || [],
          explanation: backendData.explanation,
        } as CodeBlockSuggestion;
        break;

      case "LINE_BY_LINE":
        suggestionData = {
          ...baseTransformed,
          mainLine: backendData.main_line || "",
          fixedLine: backendData.fixed_line,
          lineIndex: backendData.line_index,
        } as LineByLineSuggestion;
        break;

      case "CODE_SELECTION":
        suggestionData = {
          ...baseTransformed,
          suggestionText: backendData.suggestion_text || "",
          explanation: backendData.explanation,
        } as CodeSelectionSuggestion;
        break;

      default:
        return { error: "Invalid mode" };
    }

    return { data: suggestionData };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}
