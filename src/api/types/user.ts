export enum UserRole {
  ADMIN = "ADMIN",
  INSTRUCTOR = "INSTRUCTOR",
  STUDENT = "STUDENT",
  DEV = "DEVELOPER",
}

export enum StudentStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  LOCKED = "LOCKED",
}

export enum EnrollmentStatus {
  WAITLISTED = "WAITLISTED",
  ENROLLED = "ENROLLED",
  COMPLETED = "COMPLETED",
  REMOVED = "REMOVED",
  REJECTED = "REJECTED",
}

export enum UserMode {
  OFF = "OFF",
  BLOCK = "CODE_BLOCK",
  LINE = "LINE_BY_LINE",
  SELECTION = "CODE_SELECTION",
}

export const AUTH_CONTEXT = "authContext";

export interface User {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  status?: string;
  role: UserRole;
  settings: UserSettings;
  last_updated_at?: string;
  auth_created_at?: string;
  last_sign_in?: string;
  source?: string;
  avatar_url?: string;
}

export type UserSettings = {
  bug_percentage: number;
  show_notifications: boolean;
  enable_quiz: boolean;
  mode: UserMode;
};

export type UserActivityLogItem = {
  log_id: number;
  log_created_at: string;
  event: string;
  duration: number;
  user_id: string;
  class_id: string;
  suggestion_id: number;
  suggestion_created_at: string;
  prompt: string;
  suggestion_array: string[];
  has_bug: boolean;
  model: string;
  explanation: string | null;
  vendor: string;
  language: string;
};

export interface ClassData {
  id?: string;
  created_at?: string;
  class_title: string;
  class_code: string;
  instructor_id?: string;
  class_hex_color: string;
  class_image_cover?: string | null;
  class_description?: string | null;
  students: User[];
}
/**
 * UserClassInfo interface represents the structure of user class information.
 * It contains the user class and the student's status in that class.
 */
export interface UserClassInfo {
  user_class: ClassData;
  joined_at: string;
  enrollment_status: EnrollmentStatus;
  student_status: StudentStatus;
}
