export interface Suggestion {
  id: number;
  created_at: string;
  has_bug: boolean;
  suggestion_array: string[];
  time_lapse?: number;
  model: string;
  prompt?: string;
  accepted?: boolean;
}

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

export type ProgressData = {
  suggestions: Suggestion[];
  progress: {
    totalAccepted: number;
    totalWithBugs: number;
    percentageWithBugs: number;
  };
};
