import { ActiveUserMode } from "./user";

export enum LogEvent {
  SUGGESTION_ACCEPT = "SUGGESTION_ACCEPT",
  USER_ACCEPT = "USER_ACCEPT",
  USER_REJECT = "USER_REJECT",
  MODEL_GENERATE = "MODEL_GENERATE",
  MODEL_ERROR = "MODEL_ERROR",

  USER_SIGNUP = "USER_SIGNUP",
  USER_LOGIN = "USER_LOGIN",
  USER_LOGOUT = "USER_LOGOUT",

  USER_AUTH_GITHUB = "USER_AUTH_GITHUB",

  USER_LOCKED = "USER_LOCKED",
  USER_UNLOCKED = "USER_UNLOCKED",
}

export type SuggestionEvent =
  | "SUGGESTION_ACCEPT"
  | "SUGGESTION_REJECT"
  | "SUGGESTION_GENERATE"
  | "SUGGESTION_ERROR"
  | "SUGGESTION_LINE_ACCEPT"
  | "SUGGESTION_LINE_REJECT"
  | "SUGGESTION_LINE_GENERATE"
  | "SUGGESTION_LINE_ERROR"
  | "SUGGESTION_SELECTION_ACCEPT"
  | "SUGGESTION_SELECTION_REJECT"
  | "SUGGESTION_SELECTION_GENERATE"
  | "SUGGESTION_SELECTION_ERROR";

export const getEventsForMode = (mode: ActiveUserMode) => {
  switch (mode) {
    case "CODE_BLOCK":
      return {
        accept: "SUGGESTION_ACCEPT" as SuggestionEvent,
        reject: "SUGGESTION_REJECT" as SuggestionEvent,
      };
    case "LINE_BY_LINE":
      return {
        accept: "SUGGESTION_LINE_ACCEPT" as SuggestionEvent,
        reject: "SUGGESTION_LINE_REJECT" as SuggestionEvent,
      };
    case "CODE_SELECTION":
      return {
        accept: "SUGGESTION_SELECTION_ACCEPT" as SuggestionEvent,
        reject: "SUGGESTION_SELECTION_REJECT" as SuggestionEvent,
      };
  }
};

export interface Log {
  id: number;
  timestamp: string;
  time_lapse: number;
  event: string;
  metadata: {
    has_bug: boolean;
    suggestion_text: string;
    model: string;
    prompt: string;
  };
}
