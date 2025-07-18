import { User } from "./user";

export interface ClassPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  includeStudents?: boolean;
}

export interface UseAllClassesOptions extends ClassPaginationParams {
  enabled?: boolean;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UsersPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UseAllUsersOptions extends UsersPaginationParams {
  enabled?: boolean;
}
