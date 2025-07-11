export enum UserRole {
  STUDENT = "STUDENT",
  INSTRUCTOR = "INSTRUCTOR",
  ADMIN = "ADMIN",
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

export type ActiveUserMode = Omit<UserMode, UserMode.OFF>;

export const AUTH_CONTEXT = "authContext";

export interface User {
  id: string;
  createdAt: string; // ISO date string from Go's time.Time
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: StudentStatus;
  avatarUrl?: string;
  settings: UserSettings;
  last_updated_at?: string;
  auth_created_at?: string;
  last_sign_in?: string;
  source?: string;
}

export type UserSettings = {
  enableQuiz: boolean;
  bugPercentage: number;
  showNotifications: boolean;
  mode: string;
};

export interface ClassData {
  id: string;
  createdAt?: string;
  classTitle: string;
  classCode?: string;
  instructorId?: string;
  instructorName?: string;
  classHexColor: string;
  classImageCover?: string | null;
  classDescription?: string;
  joinedAt?: string;
  enrollmentStatus?: EnrollmentStatus;
  studentCount?: number;
  students?: User[];
}

export interface PaginatedClassResponse {
  classes: ClassData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
