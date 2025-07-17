import { ActivityLogResponse } from "./suggestion";
import { UserMode } from "./user";

export interface ClassInfo {
  id?: string;
  classTitle: string;
  classCode?: string;
  instructorId?: string;
  classHexColor: string;
  classImageCover?: string | null;
  classDescription?: string;
}

export interface StudentClassData {
  userId: string;
  fullName?: string;
  classId?: string;
  classTitle: string;
  totalAccepted: number;
  totalRejected: number;
  totalInteractions: number;
  correctSuggestions: number;
  accuracyPercentage: number;
  lastActivity: string;
  mode: UserMode;
  logs?: ActivityLogResponse;
}
