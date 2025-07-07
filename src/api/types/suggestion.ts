import { ActiveUserMode } from "./user";

interface BaseSuggestion {
  id: string;
  createdAt: string;
  prompt: string;
  hasBug: boolean;
  duration: number;
  model: string;
  vendor: string;
  language?: string;
  refinedPrompt?: string;
}

export interface CodeBlockSuggestion extends BaseSuggestion {
  suggestionArray: string[];
  explanation?: string;
}

export interface LineByLineSuggestion extends BaseSuggestion {
  mainLine?: string;
  fixedLine?: string;
  lineIndex: number;
}

export interface CodeSelectionSuggestion extends BaseSuggestion {
  suggestionText: string;
  explanation?: string;
}

export type SuggestionData =
  | CodeBlockSuggestion
  | LineByLineSuggestion
  | CodeSelectionSuggestion;

export interface AIStats {
  id: string;
  created_at: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  model: string;
  latency_seconds: number;
  provider: string;
}

export interface ProgressData {
  totalAccepted: number;
  totalRejected: number;
  totalInteractions: number;
  correctSuggestions: number;
  accuracyPercentage: number;
}

interface BaseLogResponse {
  id: string;
  event: string;
  duration: number;
  userId: string;
  classId?: string;
  createdAt: string;
  hasBug?: boolean;
}

interface BlockSuggestionLogResponse extends BaseLogResponse {
  suggestionId: string;
}

interface LineSuggestionLogResponse extends BaseLogResponse {
  lineSuggestionId: string;
}

interface SelectionSuggestionLogResponse extends BaseLogResponse {
  selectionSuggestionItemId: string;
}

export type LogResponse<T extends ActiveUserMode> = T extends "CODE_BLOCK"
  ? BlockSuggestionLogResponse[]
  : T extends "LINE_BY_LINE"
    ? LineSuggestionLogResponse[]
    : T extends "CODE_SELECTION"
      ? SelectionSuggestionLogResponse[]
      : never;

export type UserActivityLogItem =
  | BlockSuggestionLogResponse
  | LineSuggestionLogResponse
  | SelectionSuggestionLogResponse;

export function getSuggestionIdByMode(
  logItem: UserActivityLogItem,
  mode: ActiveUserMode
) {
  switch (mode) {
    case "CODE_BLOCK":
      return (logItem as BlockSuggestionLogResponse).suggestionId;
    case "LINE_BY_LINE":
      return (logItem as LineSuggestionLogResponse).lineSuggestionId;
    case "CODE_SELECTION":
      return (logItem as SelectionSuggestionLogResponse)
        .selectionSuggestionItemId;
  }
}
